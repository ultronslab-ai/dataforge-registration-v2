# DataForge User Site

Deploy this folder to Netlify as the public registration website.

## Netlify Settings

- Root directory: `deployment-ready-2/user-site`
- Build command: leave empty
- Publish directory: `.`

Before deploying, edit `js/config.js` and replace:

```js
https://YOUR-RENDER-BACKEND-URL.onrender.com/api
```

with your real Render backend API URL.
