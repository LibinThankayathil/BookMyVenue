import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';

export class UploadController {
  getSignature = (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Get current Unix timestamp (in seconds)
      const timestamp = Math.round(new Date().getTime() / 1000);

      // 2. Define parameters to sign
      const params: Record<string, string | number> = {
        timestamp,
        upload_preset: env.CLOUDINARY_UPLOAD_PRESET,
      };

      // 3. Sort parameters alphabetically and join as query string
      const sortedParamsString = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join('&');

      // 4. Append Cloudinary API Secret to the sorted query string with no separator
      const stringToSign = sortedParamsString + env.CLOUDINARY_API_SECRET;

      // 5. Generate SHA-1 cryptographic signature hash
      const signature = crypto
        .createHash('sha1')
        .update(stringToSign)
        .digest('hex');

      // 6. Return coordinates required by the frontend client to perform direct upload
      return res.status(200).json({
        success: true,
        data: {
          signature,
          timestamp,
          apiKey: env.CLOUDINARY_API_KEY,
          cloudName: env.CLOUDINARY_CLOUD_NAME,
          uploadPreset: env.CLOUDINARY_UPLOAD_PRESET,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
