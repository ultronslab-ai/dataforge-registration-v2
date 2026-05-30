# DataForge Deployment Folders v2

This folder is prepared for a clean redeploy with Supabase database storage:

- `user-site` -> Netlify public user website
- `admin-site` -> Netlify admin website
- `backend-api` -> Render backend API
- `supabase-schema.sql` -> Supabase database tables

## 1. Create Supabase Tables

Open Supabase SQL Editor, paste the contents of `supabase-schema.sql`, and run it.

## 2. Deploy Backend on Render

Use:

- Root directory: `deployment-ready-2/backend-api`
- Build command: leave empty
- Start command: `npm start`
- Environment: Node

Add these Render environment variables:

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

If Supabase is missing, the backend now fails during startup instead of using resettable JSON storage.

## 3. Connect the Websites

After backend deployment, copy its Render URL into:

- `user-site/js/config.js`
- `admin-site/js/config.js`

Replace:

```js
https://YOUR-RENDER-BACKEND-URL.onrender.com/api
```

with your real backend URL, for example:

```js
https://dataforge-api.onrender.com/api
```

Then deploy `user-site` and `admin-site` separately on Netlify.

## Important

Events and registrations persist in Supabase. Uploaded payment proofs/resumes are still local files on Render and can disappear after redeploy. For permanent uploads, move them to Supabase Storage later.
