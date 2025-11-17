import type { PDFField } from 'pdf-lib';

/**
 * Attempts to determine if a PDF field is required.
 * Note: There is no official pdf-lib API for "required".
 * Many PDFs do not encode this consistently. Defaults to false.
 */
export function isFieldRequired(field: any): boolean {
  try {
    // Try accessing underlying dict flags if available
    const dict = (field as any)?.acroField ?? (field as any)?.dict ?? (field as any)?.node;
    const flags = dict?.get?.('Ff') ?? dict?.get?.('FF') ?? dict?.get?.('Flags');
    
    // In PDF spec, "required" is not standardized; some tools set custom flags.
    // If integer bitmask exists and uses bit 1 (0x02) by convention:
    if (typeof flags === 'number') {
      const REQUIRED_BIT = 0x02; // best-effort; many PDFs won't use this
      return (flags & REQUIRED_BIT) === REQUIRED_BIT;
    }
  } catch {
    // Silently fail and return false
  }
  return false;
}

/**
 * Humanizes a field name by converting snake_case, kebab-case, or camelCase
 * to a readable label.
 */
export function humanize(name: string): string {
  return name
    .replace(/[_\-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Detects if a PDF uses XFA forms (not supported).
 */
export function detectXFA(pdfBytes: Uint8Array): boolean {
  const text = new TextDecoder('latin1').decode(pdfBytes.slice(0, Math.min(5000, pdfBytes.length)));
  // XFA forms typically have XFA entries in the PDF structure
  return /\/XFA\s+/.test(text) || /\/AcroForm[^>]*\/XFA/.test(text);
}

