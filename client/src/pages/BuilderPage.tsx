import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSchema, updateSchema } from '../api';
import type { SchemaDocument, PdfField } from '../types';
import FieldEditor from '../components/FieldEditor';
import { useDebounce } from '../hooks/useDebounce';

export default function BuilderPage() {
  const { pdfId } = useParams<{ pdfId: string }>();
  const [schema, setSchema] = useState<SchemaDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const debouncedSchema = useDebounce(schema, 1000);

  useEffect(() => {
    if (!pdfId) {
      setError('Invalid PDF ID');
      setLoading(false);
      return;
    }

    loadSchema();
  }, [pdfId]);

  const loadSchema = async () => {
    if (!pdfId) return;
    try {
      setLoading(true);
      setInitialLoad(true);
      const data = await getSchema(pdfId);
      setSchema(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load schema');
    } finally {
      setLoading(false);
      // Allow auto-save after initial load completes
      setTimeout(() => setInitialLoad(false), 500);
    }
  };

  useEffect(() => {
    if (debouncedSchema && pdfId && !loading && !initialLoad) {
      saveSchema(debouncedSchema);
    }
  }, [debouncedSchema, pdfId, loading, initialLoad]);

  const saveSchema = async (schemaToSave: SchemaDocument) => {
    if (!pdfId) return;
    try {
      setSaving(true);
      await updateSchema(pdfId, schemaToSave);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      console.error('Failed to save schema:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldUpdate = (index: number, updates: Partial<PdfField>) => {
    if (!schema) return;
    const newFields = [...schema.fields];
    newFields[index] = { ...newFields[index], ...updates };
    setSchema({ ...schema, fields: newFields });
  };

  const handleReorder = (newFields: PdfField[]) => {
    if (!schema) return;
    const reordered = newFields.map((f, i) => ({ ...f, order: i }));
    setSchema({ ...schema, fields: reordered });
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/f/${pdfId}`;
    navigator.clipboard.writeText(link);
    alert('Share link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error || 'Schema not found'}</p>
        </div>
        <Link
          to="/"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800"
        >
          ← Back to upload
        </Link>
      </div>
    );
  }

  const fieldCounts = schema.fields.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Form Builder</h1>
          <p className="text-gray-600 mt-1">
            Edit field labels, required flags, defaults, and order
          </p>
        </div>
        <div className="flex gap-2">
          {saving && (
            <span className="text-sm text-gray-500 self-center">Saving...</span>
          )}
          {saved && (
            <span className="text-sm text-green-600 self-center">Saved!</span>
          )}
          <button
            onClick={copyShareLink}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Copy Share Link
          </button>
          <Link
            to={`/f/${pdfId}`}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700
              focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Preview Form
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">PDF Metadata</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Title:</span>
            <p className="font-medium">{schema.meta.title || 'Untitled'}</p>
          </div>
          <div>
            <span className="text-gray-600">Author:</span>
            <p className="font-medium">{schema.meta.author || 'Unknown'}</p>
          </div>
          <div>
            <span className="text-gray-600">Pages:</span>
            <p className="font-medium">{schema.meta.pageCount}</p>
          </div>
          <div>
            <span className="text-gray-600">Fields:</span>
            <p className="font-medium">{schema.fields.length}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <span className="text-gray-600 text-sm">Field types: </span>
          {Object.entries(fieldCounts).map(([type, count]) => (
            <span key={type} className="ml-2 text-sm">
              <span className="font-medium">{type}</span>: {count}
            </span>
          ))}
        </div>
      </div>

      <FieldEditor
        fields={schema.fields}
        onFieldUpdate={handleFieldUpdate}
        onReorder={handleReorder}
      />

      <div className="mt-6 text-center">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Upload another PDF
        </Link>
      </div>
    </div>
  );
}

