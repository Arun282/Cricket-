# Cricket Sports Live 🏏

A Hindi-first, mobile-friendly cricket sports web app.

## Features
- Home page and match cards
- LIVE match section with authorized broadcaster embed player support
- Match scores, fixtures and results sections
- Sports news panel
- Basic local Admin panel for adding/editing/removing matches and adding news
- Responsive mobile-first dark sports design

## Run locally
Open `index.html` in a browser, or serve the folder with any static web server.

## Deploy with GitHub Pages
1. Open repository **Settings → Pages**.
2. Select **Deploy from a branch**.
3. Choose branch `main` and folder `/ (root)`, then Save.
4. Once published, use the GitHub Pages URL shown in Settings → Pages.

## Important limitations
- The Admin panel currently saves data in the current browser's localStorage. It is a starter/demo feature, not secure authentication, and changes are not shared across devices.
- Demo match cards and any demo scores are not live data.
- A licensed sports data API is required for real-time scores.
- Only embed streams you are legally authorized to show. A URL alone does not grant streaming rights. Some broadcasters restrict embedding or require a provider SDK.
- Do not put private API keys in front-end JavaScript. Use a secure backend for production.
