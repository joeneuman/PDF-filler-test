import { describe, it, expect } from 'vitest';
import { isFieldRequired, humanize, detectXFA } from './pdfUtils.js';

describe('pdfUtils', () => {
  describe('isFieldRequired', () => {
    it('should return false by default', () => {
      expect(isFieldRequired({})).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isFieldRequired(null)).toBe(false);
      expect(isFieldRequired(undefined)).toBe(false);
    });

    it('should not throw on invalid input', () => {
      expect(() => isFieldRequired({ get: () => { throw new Error(); } })).not.toThrow();
    });

    it('should handle field with flags bitmask', () => {
      const field = {
        dict: {
          get: (key: string) => {
            if (key === 'Ff') return 0x02; // Required bit set
            return undefined;
          }
        }
      };
      // Note: This is a best-effort check, may not work for all PDFs
      expect(isFieldRequired(field)).toBe(true);
    });
  });

  describe('humanize', () => {
    it('should convert snake_case to Title Case', () => {
      expect(humanize('first_name')).toBe('First Name');
    });

    it('should convert kebab-case to Title Case', () => {
      expect(humanize('last-name')).toBe('Last Name');
    });

    it('should convert camelCase to Title Case', () => {
      expect(humanize('emailAddress')).toBe('Email Address');
    });

    it('should handle mixed formats', () => {
      expect(humanize('user_email_address')).toBe('User Email Address');
    });

    it('should trim whitespace', () => {
      expect(humanize('  test_field  ')).toBe('Test Field');
    });
  });

  describe('detectXFA', () => {
    it('should detect XFA in PDF bytes', () => {
      const pdfWithXFA = new TextEncoder().encode('%PDF-1.4\n/AcroForm /XFA ');
      expect(detectXFA(pdfWithXFA)).toBe(true);
    });

    it('should return false for non-XFA PDF', () => {
      const normalPdf = new TextEncoder().encode('%PDF-1.4\n/AcroForm ');
      expect(detectXFA(normalPdf)).toBe(false);
    });
  });
});

