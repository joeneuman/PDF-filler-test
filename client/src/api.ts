import axios from 'axios';
import type { SchemaDocument, UploadResponse } from './types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function uploadPdf(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('pdf', file);
  
  const response = await api.post<UploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
}

export async function getSchema(pdfId: string): Promise<SchemaDocument> {
  const response = await api.get<SchemaDocument>(`/schema/${pdfId}`);
  return response.data;
}

export async function updateSchema(pdfId: string, schema: Partial<SchemaDocument>): Promise<SchemaDocument> {
  const response = await api.put<SchemaDocument>(`/schema/${pdfId}`, schema);
  return response.data;
}

export async function fillPdf(
  pdfId: string,
  values: Record<string, string | boolean>,
  flatten = true
): Promise<Blob> {
  const response = await api.post(
    '/fill',
    { pdfId, values, flatten },
    { responseType: 'blob' }
  );
  return response.data;
}

export async function cloneSchema(pdfId: string): Promise<SchemaDocument> {
  const response = await api.post<SchemaDocument>(`/clone/${pdfId}`);
  return response.data;
}

