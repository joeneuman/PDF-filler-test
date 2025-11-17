import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { sanitizeString } from './validation.js';

// Multer configuration
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
});

// PDF magic bytes validation
export function validatePdfMagicBytes(req: Request, res: Response, next: NextFunction) {
  if (!req.file) {
    return res.status(400).json({
      code: 'NO_FILE',
      message: 'No file uploaded',
    });
  }

  const buffer = req.file.buffer;
  if (buffer.length < 4) {
    return res.status(400).json({
      code: 'INVALID_PDF',
      message: 'File is too small to be a valid PDF',
    });
  }

  // Check for PDF magic bytes: %PDF
  const header = buffer.slice(0, 4);
  const headerStr = String.fromCharCode(...header);
  
  if (headerStr !== '%PDF') {
    return res.status(400).json({
      code: 'INVALID_PDF',
      message: 'File does not appear to be a valid PDF (missing PDF magic bytes)',
    });
  }

  // Check for JavaScript or embedded files (basic check)
  const text = new TextDecoder('latin1').decode(buffer.slice(0, Math.min(10000, buffer.length)));
  if (/\/JavaScript\s*\/JS/.test(text) || /\/EmbeddedFiles/.test(text)) {
    return res.status(400).json({
      code: 'UNSAFE_PDF',
      message: 'PDF contains JavaScript or embedded files which are not allowed for security reasons',
    });
  }

  next();
}

// Error handler
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds 10 MB limit',
      });
    }
    return res.status(400).json({
      code: 'UPLOAD_ERROR',
      message: err.message,
    });
  }

  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      code: 'INVALID_MIME_TYPE',
      message: err.message,
    });
  }

  console.error('Error:', err);
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An internal error occurred',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}

