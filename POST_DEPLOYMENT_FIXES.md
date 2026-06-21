# samaramAI — Post-Deployment Backend Fixes

This document outlines the root causes of the backend integration failures encountered after the initial deployment, and the permanent fixes applied to resolve them.

---

### 1. The Security Blocker (Helmet v8)
**The Problem:** The backend uses a security package called `helmet`. In its newest version, its default settings enforce a strict `Cross-Origin-Resource-Policy: same-origin`. This meant that even though the backend was running perfectly, it was actively blocking the frontend (`samaramai.web.app`) from reading any API responses because they were on different domains. 
**The Fix:** Reconfigured Helmet in `server/src/index.js` to explicitly allow cross-origin API fetches (`cross-origin` policy) and disabled the strict Content Security Policy since the backend just serves API JSON, not HTML.

### 2. Missing CORS Headers
**The Problem:** The frontend sends custom headers like `Authorization` and `x-target-language-name`. Browsers do a "preflight" (OPTIONS) check before allowing these custom headers. The CORS configuration wasn't explicitly allowing these specific headers, causing the browser to reject the requests before they even hit the server logic.
**The Fix:** Explicitly added `['Content-Type', 'Authorization', 'x-target-language-name']` and the `OPTIONS` method to the backend's allowed CORS config in `server/src/index.js`.

### 3. A Typo in the Render Config (`render.yaml`)
**The Problem:** In `render.yaml`, the system was configured to look for `GOOGLE_APPLICATION_CREDENTIALS_JSON`. However, the code (`visionService.js`) was actually coded to look for `GOOGLE_CLOUD_API_KEY`. Because of this mismatch, the Medicine Scanner and Translators could never access the Google Vision OCR service.
**The Fix:** Renamed the variable in `render.yaml` so the names matched perfectly.

### 4. The Missing API Keys
**The Problem:** The real API keys (Groq, Cloudinary, Google Cloud) live safely in the local `server/.env` file. Because Git ignores `.env` files (for security), Render pulled the code but **none of the API keys**. The `update-render.mjs` script was trying to help, but it was hardcoded to send fake placeholder values like `"your_groq_api_key"` to Render.
**The Fix:** Created a script (`push-env.js`) that securely read the *real* local keys from `server/.env` and injected them directly into the live Render Dashboard via their API, followed by a manual redeploy.

---

### Summary of Deployment Checks for Future
If you ever deploy a new backend environment, ensure that:
1. CORS and Helmet are correctly allowing the frontend origin.
2. The environment variable names in `render.yaml` match the ones used in the code.
3. Your actual API keys are manually synced to the Render Dashboard (since `.env` is ignored by git).
