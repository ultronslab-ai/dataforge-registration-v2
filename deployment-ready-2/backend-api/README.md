# DataForge Backend API

Deploy this folder as the backend service on Render.

## Render Settings

- Root directory: `deployment-ready-2/backend-api`
- Build command: leave empty
- Start command: `npm start`
- Environment: Node

## Required Environment Variables

```env
NODE_ENV=production
REQUIRE_SUPABASE=true
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=YOUR_BREVO_SMTP_LOGIN
SMTP_PASS=YOUR_BREVO_SMTP_KEY
CLUB_NAME=DataForge
```

Run `../supabase-schema.sql` in Supabase SQL Editor before deploying.

After deployment, copy the Render URL and replace `YOUR-RENDER-BACKEND-URL` in both frontend config files:

- `deployment-ready-2/user-site/js/config.js`
- `deployment-ready-2/admin-site/js/config.js`

Example:

```js
const DEPLOYED_API_BASE_URL = 'https://dataforge-api.onrender.com/api';
```

## Admin Login

- Username: `admin`
- Password: `cyberadmin2042`

The backend requires Supabase in production. If Supabase env vars are missing, startup will fail so data is not accidentally saved to Render's temporary filesystem.
