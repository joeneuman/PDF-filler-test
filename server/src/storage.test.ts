import { describe, it, expect, beforeEach } from 'vitest';
import { initStorage, savePdf, getPdf, saveSchema, getSchema, cloneSchema } from './storage.js';
import type { SchemaDocument } from './types.js';

describe('storage', () => {
  beforeEach(async () => {
    await initStorage();
  });

  it('should save and retrieve PDF', async () => {
    const pdfId = 'test-pdf-1';
    const pdfBytes = new Uint8Array([1, 2, 3, 4]);
    
    await savePdf(pdfId, pdfBytes);
    const retrieved = await getPdf(pdfId);
    
    expect(retrieved).not.toBeNull();
    expect(retrieved).toEqual(pdfBytes);
  });

  it('should return null for non-existent PDF', async () => {
    const retrieved = await getPdf('non-existent');
    expect(retrieved).toBeNull();
  });

  it('should save and retrieve schema', async () => {
    const schema: SchemaDocument = {
      pdfId: 'test-schema-1',
      fields: [
        {
          name: 'field1',
          label: 'Field 1',
          type: 'text',
          required: false,
          order: 0,
        },
      ],
      meta: {
        pageCount: 1,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      },
    };

    await saveSchema(schema);
    const retrieved = await getSchema('test-schema-1');
    
    expect(retrieved).not.toBeNull();
    expect(retrieved?.pdfId).toBe(schema.pdfId);
    expect(retrieved?.fields).toEqual(schema.fields);
  });

  it('should clone schema', async () => {
    const source: SchemaDocument = {
      pdfId: 'source-schema',
      fields: [
        {
          name: 'field1',
          label: 'Field 1',
          type: 'text',
          required: false,
          order: 0,
        },
      ],
      meta: {
        pageCount: 1,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      },
    };

    await saveSchema(source);
    const cloned = await cloneSchema('source-schema', 'cloned-schema');
    
    expect(cloned).not.toBeNull();
    expect(cloned?.pdfId).toBe('cloned-schema');
    expect(cloned?.fields).toEqual(source.fields);
    expect(cloned?.meta.created).not.toBe(source.meta.created);
  });
});

