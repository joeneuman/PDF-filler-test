import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getSchema, fillPdf } from '../api';
import type { SchemaDocument } from '../types';
import FormRenderer from '../components/FormRenderer';

export default function FillerPage() {
  const { pdfId } = useParams<{ pdfId: string }>();
  const navigate = useNavigate();
  const [schema, setSchema] = useState<SchemaDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [flatten, setFlatten] = useState(true);
  const [hideDefaults, setHideDefaults] = useState(true);

  const form = useForm<Record<string, string | boolean>>({
    defaultValues: {},
  });

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
      const data = await getSchema(pdfId);
      setSchema(data);
      
      // Set default values
      const defaults: Record<string, string | boolean> = {};
      data.fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          defaults[field.name] = field.defaultValue;
        }
      });
      form.reset(defaults);
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: Record<string, string | boolean>) => {
    if (!pdfId) return;
    
    setSubmitting(true);
    try {
      const blob = await fillPdf(pdfId, values, flatten);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `filled-${pdfId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fill PDF');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-600">Loading form...</p>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error || 'Form not found'}</p>
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {schema.meta.title || 'Fill Form'}
        </h1>
        {schema.meta.author && (
          <p className="text-gray-600 mt-1">By {schema.meta.author}</p>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <FormRenderer 
            fields={hideDefaults 
              ? schema.fields.filter(field => field.defaultValue === undefined) 
              : schema.fields
            } 
            form={form} 
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hideDefaults}
              onChange={(e) => setHideDefaults(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Hide default values
            </span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={flatten}
              onChange={(e) => setFlatten(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Flatten filled fields (make form non-editable in PDF)
            </span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700
              disabled:bg-gray-400 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              transition-colors font-medium"
          >
            {submitting ? 'Generating PDF...' : 'Fill & Download PDF'}
          </button>
        </div>
      </form>

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

