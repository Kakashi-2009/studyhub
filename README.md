# StudyHub

A dark-mode-first student productivity dashboard built with React, Vite, Tailwind CSS, Recharts, and Framer Motion.

## Quick start

```bash
cd studyhub
npm install
cp .env.example .env   # add your OpenWeatherMap API key
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Features

- Dashboard with progress graph, homework, Pomodoro timer, and daily quote
- Bookmarks, file uploads, notes editor, and skills tracker
- Draggable calculator (standard + scientific) with mathjs
- Settings drawer with theme, accent colors, weather, and data export
- All data persisted in `localStorage`

## Environment

Set `VITE_OPENWEATHER_API_KEY` in `.env` for the header weather widget (enable location in Settings).

### Google Sign-In

1. Create an OAuth Client ID in [Google Cloud Console](https://console.cloud.google.com/) (Web application).
2. Add **Authorised JavaScript origins**: `http://localhost:5173`
3. Add to `.env`:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

4. Restart `npm run dev`, then use **Settings → Account → Sign in with Google**.
