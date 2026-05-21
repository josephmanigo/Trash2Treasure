import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY;
const AVATAR_BUCKET = process.env.SUPABASE_AVATAR_BUCKET || 'avatars';

const missingSupabaseEnv = [
  ['VITE_SUPABASE_URL or SUPABASE_URL', SUPABASE_URL],
  ['VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY', SUPABASE_ANON_KEY],
  ['SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY', SUPABASE_SERVICE_ROLE_KEY],
]
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingSupabaseEnv.length) {
  throw new Error(`Missing required Supabase environment variables: ${missingSupabaseEnv.join(', ')}`);
}

const supabaseOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};

const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, supabaseOptions);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, supabaseOptions);

const PROFILE_COLUMNS = 'id, name, email, avatar_url, method, created_at, updated_at';
const IMAGE_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

app.use(cors());
app.use(express.json());

// Serve React frontend in production.
app.use(express.static(path.join(__dirname, '../dist')));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (IMAGE_EXTENSIONS[file.mimetype]) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const authMethodFromUser = (authUser, fallback = 'email') => {
  if (authUser?.is_anonymous) return 'guest';
  const provider = authUser?.app_metadata?.provider;
  const identityProviders = authUser?.identities?.map(identity => identity.provider) || [];
  if (provider === 'google' || identityProviders.includes('google')) return 'google';
  return fallback;
};

const profileDefaultsFromAuthUser = (authUser, fallbackMethod) => {
  const metadata = authUser?.user_metadata || {};
  const email = authUser?.email || null;
  return {
    id: authUser.id,
    name:
      metadata.full_name ||
      metadata.name ||
      email?.split('@')[0] ||
      `Guest_${authUser.id.slice(0, 8)}`,
    email,
    avatar_url: metadata.avatar_url || metadata.picture || null,
    method: authMethodFromUser(authUser, fallbackMethod),
  };
};

const toClientUser = (profile, authUser) => ({
  id: profile.id,
  name: profile.name,
  email: profile.email || authUser?.email || '',
  avatar: profile.avatar_url || null,
  method: profile.method || authMethodFromUser(authUser),
});

const getProfile = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const ensureProfile = async (authUser, overrides = {}) => {
  const existing = await getProfile(authUser.id);
  const defaults = profileDefaultsFromAuthUser(authUser, overrides.method);
  const now = new Date().toISOString();
  const payload = {
    id: authUser.id,
    name: overrides.name ?? existing?.name ?? defaults.name,
    email: authUser.email ?? overrides.email ?? existing?.email ?? defaults.email,
    avatar_url: overrides.avatar_url ?? existing?.avatar_url ?? defaults.avatar_url,
    method: overrides.method ?? existing?.method ?? defaults.method,
    updated_at: now,
  };

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select(PROFILE_COLUMNS)
    .single();

  if (error) throw error;
  return toClientUser(data, authUser);
};

const sendSession = async (res, authUser, session, profileOverrides = {}) => {
  if (!authUser || !session?.access_token) {
    return res.status(500).json({ error: 'Supabase did not return a valid session' });
  }

  const user = await ensureProfile(authUser, profileOverrides);
  return res.json({
    user,
    token: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at,
  });
};

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: 'Invalid token' });

  try {
    req.authToken = token;
    req.authUser = data.user;
    req.user = await ensureProfile(data.user);
    next();
  } catch (err) {
    console.error('Profile lookup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const mapAuthError = (error, fallback = 'Authentication failed') => {
  const message = error?.message || fallback;
  if (/already registered|already exists|duplicate/i.test(message)) {
    return { status: 400, error: 'An account with this email already exists' };
  }
  if (/invalid login credentials|invalid credentials/i.test(message)) {
    return { status: 400, error: 'Invalid email or password' };
  }
  return { status: 500, error: message };
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = req.body.email?.toLowerCase().trim();
    if (!name?.trim() || !email || !password) return res.status(400).json({ error: 'All fields are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const displayName = name.trim();
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: displayName,
        full_name: displayName,
      },
    });

    if (createError) {
      const mapped = mapAuthError(createError, 'Registration failed');
      return res.status(mapped.status).json({ error: mapped.error });
    }

    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
    if (error) {
      const mapped = mapAuthError(error, 'Registration failed');
      return res.status(mapped.status).json({ error: mapped.error });
    }

    return sendSession(res, data.user, data.session, { name: displayName, method: 'email' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.toLowerCase().trim();
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
    if (error) {
      const mapped = mapAuthError(error, 'Invalid email or password');
      return res.status(mapped.status).json({ error: mapped.error });
    }

    return sendSession(res, data.user, data.session, { method: 'email' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential required' });

    const { data, error } = await supabaseAuth.auth.signInWithIdToken({
      provider: 'google',
      token: credential,
    });

    if (error) {
      console.error('Google Supabase auth error:', error);
      return res.status(400).json({ error: 'Google authentication failed' });
    }

    return sendSession(res, data.user, data.session, { method: 'google' });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(500).json({ error: 'Google authentication failed' });
  }
});

app.post('/api/auth/guest', async (req, res) => {
  try {
    const guestName = `Guest_${Math.floor(Math.random() * 10000)}`;
    const { data, error } = await supabaseAuth.auth.signInAnonymously({
      options: {
        data: {
          name: guestName,
          full_name: guestName,
        },
      },
    });

    if (error) {
      console.error('Guest Supabase auth error:', error);
      return res.status(500).json({ error: 'Enable anonymous sign-ins in Supabase Auth to use guest login' });
    }

    return sendSession(res, data.user, data.session, { name: guestName, method: 'guest' });
  } catch (err) {
    console.error('Guest login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken || req.body.refresh_token;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    const { data, error } = await supabaseAuth.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data?.session) return res.status(401).json({ error: 'Invalid refresh token' });
    return sendSession(res, data.user, data.session);
  } catch (err) {
    console.error('Refresh session error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Profile routes
app.put('/api/profile/name', authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

    const displayName = name.trim();
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ name: displayName, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)
      .select(PROFILE_COLUMNS)
      .single();

    if (error) throw error;

    supabaseAdmin.auth.admin.updateUserById(req.user.id, {
      user_metadata: {
        ...req.authUser.user_metadata,
        name: displayName,
        full_name: displayName,
      },
    }).catch(err => console.warn('Could not update Supabase auth metadata:', err.message));

    res.json({ user: toClientUser(data, req.authUser) });
  } catch (err) {
    console.error('Update name error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/profile/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const extension = IMAGE_EXTENSIONS[req.file.mimetype] || path.extname(req.file.originalname).toLowerCase() || '.png';
    const storagePath = `${req.user.id}/avatar-${Date.now()}${extension}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(AVATAR_BUCKET)
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase avatar upload error:', uploadError);
      return res.status(500).json({ error: 'Avatar upload failed. Check the Supabase avatars bucket migration.' });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(storagePath);

    const avatarUrl = publicUrlData.publicUrl;
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)
      .select(PROFILE_COLUMNS)
      .single();

    if (error) throw error;

    supabaseAdmin.auth.admin.updateUserById(req.user.id, {
      user_metadata: {
        ...req.authUser.user_metadata,
        avatar_url: avatarUrl,
        picture: avatarUrl,
      },
    }).catch(err => console.warn('Could not update Supabase auth avatar metadata:', err.message));

    res.json({ user: toClientUser(data, req.authUser) });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/profile', authenticate, async (req, res) => {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(req.user.id);
    if (error) throw error;
    res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  } else {
    next();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Trash2Treasure API running on port ${PORT}`);
});
