import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { extractSchema, fillPdf } from './pdfExtractor.js';
import { savePdf, getPdf, saveSchema, getSchema, cloneSchema } from './storage.js';
import { fillRequestSchema, schemaUpdateSchema } from './validation.js';
import { upload, validatePdfMagicBytes } from './middleware.js';
import type { SchemaDocument, UploadResponse, FillRequest } from './types.js';

const router = Router();

// POST /api/upload
router.post('/upload', upload.single('pdf'), validatePdfMagicBytes, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 'NO_FILE',
        message: 'No file uploaded',
      });
    }

    const pdfBytes = new Uint8Array(req.file.buffer);
    const pdfId = uuidv4();
    const now = new Date().toISOString();

    // Extract schema
    const result = await extractSchema(pdfBytes);
    
    if (result.error) {
      return res.status(400).json(result.error);
    }

    if (!result.fields || result.fields.length === 0) {
      return res.status(400).json({
        code: 'NO_FIELDS',
        message: 'PDF has form structure but no extractable fields',
      });
    }

    // Save PDF
    await savePdf(pdfId, pdfBytes);

    // Create and save schema
    const schema: SchemaDocument = {
      pdfId,
      fields: result.fields,
      meta: {
        ...result.meta,
        created: now,
        modified: now,
      },
    };
    await saveSchema(schema);

    const response: UploadResponse = {
      pdfId,
      fields: result.fields,
      meta: schema.meta,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({
      code: 'EXTRACTION_ERROR',
      message: 'Failed to extract form fields from PDF',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/schema/:pdfId
router.get('/schema/:pdfId', async (req: Request, res: Response) => {
  try {
    const { pdfId } = req.params;
    const schema = await getSchema(pdfId);
    
    if (!schema) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'PDF schema not found',
      });
    }

    res.json(schema);
  } catch (error: any) {
    console.error('Get schema error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve schema',
    });
  }
});

// PUT /api/schema/:pdfId
router.put('/schema/:pdfId', async (req: Request, res: Response) => {
  try {
    const { pdfId } = req.params;
    
    // Validate request body
    const validationResult = schemaUpdateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid schema data',
        details: validationResult.error.errors,
      });
    }

    const existing = await getSchema(pdfId);
    if (!existing) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'PDF schema not found',
      });
    }

    // Update schema
    const updated: SchemaDocument = {
      pdfId,
      fields: validationResult.data.fields,
      meta: {
        ...(validationResult.data.meta || existing.meta),
        modified: new Date().toISOString(),
      },
    };

    await saveSchema(updated);
    res.json(updated);
  } catch (error: any) {
    console.error('Update schema error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to update schema',
    });
  }
});

// POST /api/fill
router.post('/fill', async (req: Request, res: Response) => {
  try {
    const validationResult = fillRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid fill request',
        details: validationResult.error.errors,
      });
    }

    const { pdfId, values, flatten } = validationResult.data;

    // Get original PDF
    const pdfBytes = await getPdf(pdfId);
    if (!pdfBytes) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'PDF not found',
      });
    }

    // Fill PDF
    const filledPdf = await fillPdf(pdfBytes, values, flatten ?? true);

    // Return as download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="filled-${pdfId}.pdf"`);
    res.send(Buffer.from(filledPdf));
  } catch (error: any) {
    console.error('Fill error:', error);
    res.status(500).json({
      code: 'FILL_ERROR',
      message: 'Failed to fill PDF',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST /api/clone/:pdfId
router.post('/clone/:pdfId', async (req: Request, res: Response) => {
  try {
    const { pdfId } = req.params;
    const newPdfId = uuidv4();

    const cloned = await cloneSchema(pdfId, newPdfId);
    if (!cloned) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Source PDF schema not found',
      });
    }

    // Also clone the PDF file
    const sourcePdf = await getPdf(pdfId);
    if (sourcePdf) {
      await savePdf(newPdfId, sourcePdf);
    }

    res.json(cloned);
  } catch (error: any) {
    console.error('Clone error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to clone schema',
    });
  }
});

export default router;

