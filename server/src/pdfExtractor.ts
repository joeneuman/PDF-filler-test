import { PDFDocument } from 'pdf-lib';
import { isFieldRequired, humanize, detectXFA } from './pdfUtils.js';
import type { PdfField, UploadResponse } from './types.js';

export async function extractSchema(pdfBytes: Uint8Array): Promise<{ error?: { code: string; message: string }; fields?: PdfField[]; meta?: any }> {
  // Check for XFA
  if (detectXFA(pdfBytes)) {
    return {
      error: {
        code: 'XFA_UNSUPPORTED',
        message: 'This PDF uses XFA forms which are not supported by standard PDF readers.'
      }
    };
  }

  const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });
  const form = pdfDoc.getForm();
  
  if (!form) {
    return {
      error: {
        code: 'NO_ACROFORM',
        message: 'This PDF has no interactive form fields.'
      }
    };
  }

  const fields = form.getFields();
  const result: PdfField[] = [];
  let order = 0;

  for (const f of fields) {
    const name = f.getName();
    const ctor = (f as any).constructor?.name;
    let type: PdfField['type'] = 'text';
    let options: { value: string; label: string }[] | undefined;
    let group: string | undefined;

    if (ctor === 'PDFTextField') {
      // Check if multiline by examining flags or default appearance
      try {
        const dict = (f as any)?.acroField ?? (f as any)?.dict;
        const flags = dict?.get?.('Ff');
        if (typeof flags === 'number' && (flags & 0x1000) === 0x1000) {
          type = 'textarea'; // Multiline flag
        } else {
          // Try to detect date fields by name patterns
          const lowerName = name.toLowerCase();
          if (lowerName.includes('date') || lowerName.includes('dob') || lowerName.includes('birth')) {
            type = 'date';
          } else {
            type = 'text';
          }
        }
      } catch {
        type = 'text';
      }
    } else if (ctor === 'PDFCheckBox') {
      type = 'checkbox';
    } else if (ctor === 'PDFRadioGroup') {
      type = 'radio';
      group = name;
      try {
        const opts = (f as any).getOptions?.() ?? [];
        options = opts.map((o: string) => ({ value: o, label: humanize(o) }));
      } catch {
        options = [];
      }
    } else if (ctor === 'PDFDropdown' || ctor === 'PDFOptionList') {
      type = 'select';
      try {
        const opts = (f as any).getOptions?.() ?? [];
        options = opts.map((o: string) => ({ value: o, label: humanize(o) }));
      } catch {
        options = [];
      }
    }

    result.push({
      name,
      label: humanize(name),
      type,
      required: isFieldRequired(f),
      options,
      defaultValue: undefined,
      group,
      order: order++,
    });
  }

  // Get metadata
  const title = pdfDoc.getTitle();
  const author = pdfDoc.getAuthor();
  const pageCount = pdfDoc.getPageCount();

  return {
    fields: result,
    meta: {
      title: title || undefined,
      author: author || undefined,
      pageCount,
    }
  };
}

export async function fillPdf(
  pdfBytes: Uint8Array,
  values: Record<string, string | boolean>,
  flatten = true
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  for (const f of fields) {
    const name = f.getName();
    const val = values[name];
    const ctor = (f as any).constructor?.name;

    if (val === undefined || val === null) {
      continue;
    }

    try {
      if (ctor === 'PDFTextField') {
        // Handle date fields - format to yyyy-mm-dd if needed
        let textValue = String(val ?? '');
        // If it's a date string, ensure it's in a format PDF can handle
        if (textValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Already in yyyy-mm-dd format, use as-is
        }
        (f as any).setText(textValue);
      } else if (ctor === 'PDFCheckBox') {
        const valStr = String(val);
        const truthy = val === true || valStr === 'true' || valStr === '1' || valStr === 'on' || valStr === 'yes';
        truthy ? (f as any).check() : (f as any).uncheck();
      } else if (ctor === 'PDFRadioGroup') {
        if (typeof val === 'string') {
          (f as any).select(val);
        }
      } else if (ctor === 'PDFDropdown' || ctor === 'PDFOptionList') {
        if (typeof val === 'string') {
          (f as any).select(val);
        }
      }
    } catch (error) {
      // Log but continue with other fields
      console.warn(`Failed to fill field ${name}:`, error);
    }
  }

  if (flatten) {
    form.flatten();
  }

  return await pdfDoc.save();
}

