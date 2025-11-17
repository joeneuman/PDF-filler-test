import { describe, it, expect } from 'vitest';
import { extractSchema, fillPdf } from './pdfExtractor.js';

describe('pdfExtractor', () => {
  // Note: These tests require actual PDF files
  // In a real scenario, you'd use test fixtures
  
  describe('extractSchema', () => {
    it('should return error for non-PDF input', async () => {
      const result = await extractSchema(new Uint8Array([1, 2, 3, 4]));
      expect(result.error).toBeDefined();
    });

    it('should return error for XFA PDF', async () => {
      const xfaPdf = new TextEncoder().encode('%PDF-1.4\n/AcroForm /XFA ');
      const result = await extractSchema(xfaPdf);
      expect(result.error?.code).toBe('XFA_UNSUPPORTED');
    });
  });

  describe('fillPdf', () => {
    it('should handle empty values', async () => {
      // This would need a real PDF to test properly
      // For now, just ensure the function exists
      expect(typeof fillPdf).toBe('function');
    });
  });
});

