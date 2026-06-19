// ═══════════════════════════════════════════════════════════════
// samaramAI — Cloudinary Upload Service
// ═══════════════════════════════════════════════════════════════

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export type CloudinaryFolder = 
  | 'samaramai/reports' 
  | 'samaramai/prescriptions' 
  | 'samaramai/medicine-scans';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  original_filename: string;
}

/**
 * Uploads a file to Cloudinary using an unsigned upload preset.
 */
export async function uploadToCloudinary(
  file: File | string, 
  folder: CloudinaryFolder
): Promise<CloudinaryUploadResponse> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration is missing. Please check your .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
      format: data.format,
      original_filename: data.original_filename,
    };
  } catch (error) {
    console.error('[Cloudinary] Upload Error:', error);
    throw error;
  }
}
