// ═══════════════════════════════════════════════════════════════
// samaramAI — Google Vision OCR Service (REST API with API Key)
// Only extracts raw text. Groq AI does ALL interpretation.
// Uses the REST API directly — no service account JSON needed.
// ═══════════════════════════════════════════════════════════════

import dotenv from 'dotenv';

dotenv.config();

const VISION_API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate`;

/**
 * Extract raw text from an image using Google Cloud Vision REST API.
 * Returns the raw OCR text only — all interpretation is done by Groq AI.
 * @param {string} base64Image - Base64 encoded image (without data URI prefix)
 */
export async function extractTextFromImage(base64Image) {
  if (!VISION_API_KEY) {
    console.error('[GoogleVision] GOOGLE_CLOUD_API_KEY is not set in .env');
    return {
      fullText: '',
      success: false,
      error: 'Google Vision API key not configured',
    };
  }

  try {
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 10,
            },
          ],
        },
      ],
    };

    const response = await fetch(`${VISION_API_URL}?key=${VISION_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.error?.message || `HTTP ${response.status}`;
      console.error('[GoogleVision] API Error:', errorMsg);
      return {
        fullText: '',
        success: false,
        error: `Vision API error: ${errorMsg}`,
      };
    }

    const data = await response.json();
    const annotations = data.responses?.[0]?.textAnnotations;
    const fullText = annotations?.[0]?.description || '';

    return {
      fullText: fullText.trim(),
      success: fullText.length > 0,
    };
  } catch (error) {
    console.error('[GoogleVision] OCR Error:', error.message);
    return {
      fullText: '',
      success: false,
      error: 'OCR service unavailable',
    };
  }
}
