import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configure Cloudinary with direct credentials
cloudinary.config({
  cloud_name: 'dvgewacb7',
  api_key: '238391684591371',
  api_secret: '6vbkTWWobbPi1SvmuPpAwL5AUYA',
  secure: true
});

// Multer configuration for memory storage
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/mov', 'video/avi', 'video/quicktime',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  }
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  bytes: number;
  format: string;
  resource_type: string;
}

export async function uploadToCloudinary(
  buffer: Buffer, 
  filename: string, 
  folder: string = 'alumni-platform'
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            bytes: result.bytes,
            format: result.format,
            resource_type: result.resource_type
          });
        } else {
          reject(new Error('Upload failed'));
        }
      }
    ).end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete from Cloudinary:', error);
    throw error;
  }
}

export default cloudinary;