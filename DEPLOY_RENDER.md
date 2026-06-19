Deploying samaramAI Backend to Render

Overview
- Backend service is configured in `render.yaml` (service name: `samaramai-api`).
- Keep secrets out of Git. Use Render Dashboard or API to set sensitive env vars listed below.

Required secrets (set as Render "Environment Variables" -> "Secret")
- GROQ_API_KEY
- GOOGLE_APPLICATION_CREDENTIALS_JSON (service account JSON string)
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- FIREBASE_SERVICE_ACCOUNT_JSON (if using firebase-admin on server)
- OPENAI_API_KEY (if applicable)

Quick steps (Render Dashboard)
1. Go to https://dashboard.render.com and log in.
2. Select the `samaramai-api` service (or create a new Web Service and point rootDir to `server`).
3. Under "Environment", add the keys above and mark them as Secret.
4. Click "Manual Deploy" to trigger a deploy.

Quick steps (Render API)
- Replace `RENDER_API_KEY` with your Render API key and `SERVICE_ID` with your service id.

Set a secret via curl:

```bash
curl -X POST "https://api.render.com/v1/services/$SERVICE_ID/env-vars" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"key":"GROQ_API_KEY","value":"your_groq_api_key","secure":true}'
```

Trigger a manual deploy:

```bash
curl -X POST "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":true}'
```

Notes & Safety
- Do NOT commit real keys to the repository. Use the `.env.template` files we added as placeholders.
- `render.yaml` already marks many keys with `sync: false` so Render won't sync them from the repo — set them in the dashboard.

If you want, provide your Render API key in a secure channel and I can set the secrets and trigger a deploy for you; otherwise follow the steps above.
