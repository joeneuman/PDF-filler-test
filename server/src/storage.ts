import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { SchemaDocument, PdfField } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STORAGE_DIR = process.env.STORAGE_DIR || join(__dirname, '..', 'storage');
const PDFS_DIR = join(STORAGE_DIR, 'pdfs');
const SCHEMAS_DIR = join(STORAGE_DIR, 'schemas');
const INDEX_FILE = join(STORAGE_DIR, 'index.json');

interface IndexEntry {
  pdfId: string;
  created: string;
  modified: string;
  title?: string;
}

let indexCache: IndexEntry[] | null = null;

async function ensureDirectories() {
  await fs.mkdir(PDFS_DIR, { recursive: true });
  await fs.mkdir(SCHEMAS_DIR, { recursive: true });
}

async function loadIndex(): Promise<IndexEntry[]> {
  if (indexCache) return indexCache;
  
  try {
    const data = await fs.readFile(INDEX_FILE, 'utf-8');
    indexCache = JSON.parse(data);
    return indexCache!;
  } catch {
    indexCache = [];
    return [];
  }
}

async function saveIndex(index: IndexEntry[]) {
  indexCache = index;
  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
}

export async function initStorage() {
  await ensureDirectories();
  await loadIndex();
}

export async function savePdf(pdfId: string, pdfBytes: Uint8Array): Promise<void> {
  await ensureDirectories();
  const filePath = join(PDFS_DIR, `${pdfId}.pdf`);
  await fs.writeFile(filePath, pdfBytes);
}

export async function getPdf(pdfId: string): Promise<Uint8Array | null> {
  try {
    const filePath = join(PDFS_DIR, `${pdfId}.pdf`);
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

export async function saveSchema(schema: SchemaDocument): Promise<void> {
  await ensureDirectories();
  const filePath = join(SCHEMAS_DIR, `${schema.pdfId}.json`);
  await fs.writeFile(filePath, JSON.stringify(schema, null, 2), 'utf-8');
  
  // Update index
  const index = await loadIndex();
  const existing = index.findIndex(e => e.pdfId === schema.pdfId);
  const entry: IndexEntry = {
    pdfId: schema.pdfId,
    created: schema.meta.created,
    modified: schema.meta.modified,
    title: schema.meta.title,
  };
  
  if (existing >= 0) {
    index[existing] = entry;
  } else {
    index.push(entry);
  }
  
  await saveIndex(index);
}

export async function getSchema(pdfId: string): Promise<SchemaDocument | null> {
  try {
    const filePath = join(SCHEMAS_DIR, `${pdfId}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function cloneSchema(sourcePdfId: string, newPdfId: string): Promise<SchemaDocument | null> {
  const source = await getSchema(sourcePdfId);
  if (!source) return null;
  
  const now = new Date().toISOString();
  const cloned: SchemaDocument = {
    ...source,
    pdfId: newPdfId,
    meta: {
      ...source.meta,
      created: now,
      modified: now,
    },
  };
  
  await saveSchema(cloned);
  return cloned;
}

