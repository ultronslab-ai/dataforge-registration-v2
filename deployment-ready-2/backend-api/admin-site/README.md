# DataForge Admin Site

Deploy this folder to Netlify as the private admin website.

## Netlify Settings

- Root directory: `deployment-ready-2/admin-site`
- Build command: leave empty
- Publish directory: `.`

Before deploying, edit `js/config.js` and replace:

```js
https://YOUR-RENDER-BACKEND-URL.onrender.com/api
```

with your real Render backend API URL.

Admin login page:

```text
/login.html
```
