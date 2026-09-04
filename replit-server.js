// Minimal static file server for Replit UI testing only.
// Not used by Netlify (which serves the site directly as static files + separate Functions).
// This just lets Replit run the exact same frontend (index.html, app.js, compliance.js, styles.css)
// for visual testing, since the frontend talks directly to Supabase and doesn't need
// the Netlify webhook/scheduled functions to render or be clicked around in.
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`DMS Transport Workspace (Replit UI test server) running on port ${PORT}`);
});
