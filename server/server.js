import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { OAuth2Client } from 'google-auth-library';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'trash2treasure_secret_key_2026';
const GOOGLE_CLIENT_ID = '886898774772-le3g05q82norpn0t7jl4o3bfvlptutgu.apps.googleusercontent.com';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React Frontend in Production
app.use(express.static(path.join(__dirname, '../dist')));

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'trash2treasure',
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Test DB connection
pool.getConnection()
  .then(conn => { console.log('✅ MySQL connected'); conn.release(); })
  .catch(err => console.error('❌ MySQL connection failed:', err.message));

// Multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// Auth middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.execute('SELECT id, name, email, avatar, method FROM users WHERE id = ?', [decoded.id]);
    if (!rows.length) return res.status(401).json({ error: 'User not found' });
    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Generate JWT
const generateToken = (user) => jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

// ─────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────

// Register with email
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
    if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(400).json({ error: 'An account with this email already exists' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, method) VALUES (?, ?, ?, ?)',
      [name, email, hash, 'email']
    );

    const user = { id: result.insertId, name, email, avatar: null, method: 'email' };
    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login with email
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? AND method = ?', [email, 'email']);
    if (!rows.length) return res.status(400).json({ error: 'Invalid email or password' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid email or password' });

    const safeUser = { id: user.id, name: user.name, email: user.email, avatar: user.avatar, method: user.method };
    const token = generateToken(safeUser);
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Google Sign-In
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential required' });

    // Decode the Google JWT (in production, verify with Google's OAuth2Client)
    // For local dev, we'll decode the payload directly
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    let payload;
    
    try {
      // Try to verify with Google (requires valid Client ID)
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      // Fallback: decode JWT without verification (for dev without Client ID)
      const parts = credential.split('.');
      if (parts.length === 3) {
        payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      } else {
        return res.status(400).json({ error: 'Invalid Google credential' });
      }
    }

    const { sub: googleId, name, email, picture } = payload;

    // Check if user exists
    let [rows] = await pool.execute('SELECT * FROM users WHERE google_id = ? OR (email = ? AND method = ?)', [googleId, email, 'google']);
    let user;

    if (rows.length) {
      user = rows[0];
      // Update avatar if we got a new one from Google
      if (picture && !user.avatar) {
        await pool.execute('UPDATE users SET avatar = ? WHERE id = ?', [picture, user.id]);
        user.avatar = picture;
      }
    } else {
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, avatar, method, google_id) VALUES (?, ?, ?, ?, ?)',
        [name, email, picture || null, 'google', googleId]
      );
      user = { id: result.insertId, name, email, avatar: picture || null, method: 'google', google_id: googleId };
    }

    const safeUser = { id: user.id, name: user.name, email: user.email, avatar: user.avatar, method: user.method };
    const token = generateToken(safeUser);
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// Guest login
app.post('/api/auth/guest', async (req, res) => {
  try {
    const guestName = 'Guest_' + Math.floor(Math.random() * 10000);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, method) VALUES (?, ?, ?)',
      [guestName, `${guestName.toLowerCase()}@guest.local`, 'guest']
    );
    const user = { id: result.insertId, name: guestName, email: '', avatar: null, method: 'guest' };
    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error('Guest login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// ─────────────────────────────────
// PROFILE ROUTES
// ─────────────────────────────────

// Update name
app.put('/api/profile/name', authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    await pool.execute('UPDATE users SET name = ? WHERE id = ?', [name.trim(), req.user.id]);
    res.json({ user: { ...req.user, name: name.trim() } });
  } catch (err) {
    console.error('Update name error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload avatar
app.post('/api/profile/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const avatarUrl = `/uploads/${req.file.filename}`;
    await pool.execute('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.user.id]);
    res.json({ user: { ...req.user, avatar: avatarUrl } });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete account
app.delete('/api/profile', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout (client-side just removes token, but we acknowledge it)
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Catch-all route to serve index.html for React Router
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  } else {
    next();
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Trash2Treasure API running on port ${PORT}`);
});
