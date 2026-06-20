# samaramAI Deployment Guide

## Architecture

The project is structured as a split-repo:
- **Client (Frontend)**: React + Vite application (`client/` directory)
- **Server (Backend)**: Express API (`server/` directory)
- **Database/Storage**: Firebase (`server/firebase/` for rules)

## 1. Frontend Deployment (Netlify)

The client is deployed to Netlify using the configuration in `client/netlify.toml`.

**Build Settings**:
- Base directory: `client`
- Build command: `npm run build`
- Publish directory: `dist`

## 2. Backend Deployment (Render)

The server is deployed to Render using the configuration in the root `render.yaml`. 
*(Note: `render.yaml` must stay at the project root for Render auto-detection).*

**Service details**:
- Environment: Node
- Build command: `cd server && npm install`
- Start command: `cd server && npm start`

## 3. Firebase Deployment

Firebase rules and indexes are stored in `server/firebase/`. Deployment configuration is in `deployment/firebase/`.

To deploy Firebase rules/indexes from the CLI:

```bash
# Run from the project root
firebase deploy --only firestore,storage --config deployment/firebase/firebase.json
```

## Local Development

1. Setup environment variables:
   - Copy `client/.env.example` to `client/.env`
   - Copy `server/.env.example` to `server/.env`

2. Start the backend:
   ```bash
   cd server
   npm install
   npm start
   ```

3. Start the frontend:
   ```bash
   cd client
   npm install
   npm run dev
   ```
