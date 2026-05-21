# Trash2Treasure

## Supabase backend setup

1. Create a Supabase project.
2. Apply `supabase/migrations/20260522000100_init_supabase_backend.sql` with the Supabase CLI (`supabase db push`) or paste it into the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_GOOGLE_CLIENT_ID`
4. In Supabase Auth, enable Email sign-ins. Enable Anonymous sign-ins if you want guest login.
5. For Google login, configure the Google provider in Supabase Auth and use the same client ID as `VITE_GOOGLE_CLIENT_ID`.

Run locally with:

```sh
npm run dev
npm start
```

On Vercel, `/api/*` requests are handled by `api/[...path].js`, which imports the Express app from `server/server.js`.
