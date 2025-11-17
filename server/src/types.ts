export interface PdfField {
  name: string;            // exact PDF field name
  label: string;           // editable human label
  type: 'text' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'date';
  required: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string | boolean;
  group?: string;          // for radio groups
  order: number;           // for UI ordering
}

export interface UploadResponse {
  pdfId: string;           // persistent id
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

export interface FillRequest {
  pdfId: string;
  values: Record<string, string | boolean>;
  flatten?: boolean;
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

