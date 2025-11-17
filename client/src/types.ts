export interface PdfField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'date';
  required: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string | boolean;
  group?: string;
  order: number;
}

export interface SchemaDocument {
  pdfId: string;
  fields: PdfField[];
  meta: {
    title?: string;
    author?: string;
    pageCount: number;
    created: string;
    modified: string;
  };
}

export interface UploadResponse {
  pdfId: string;
  fields: PdfField[];
  notes?: string[];
  meta: {
    title?: string;
    author?: string;
    pageCount: number;
    created?: string;
    modified?: string;
  };
}

