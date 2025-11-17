import { UseFormReturn } from 'react-hook-form';
import type { PdfField } from '../types';

interface FormRendererProps {
  fields: PdfField[];
  form: UseFormReturn<Record<string, string | boolean>>;
}

export default function FormRenderer({ fields, form }: FormRendererProps) {
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {sortedFields.map((field) => {
        const fieldName = field.name;
        const isRequired = field.required;
        const error = form.formState.errors[fieldName];

        return (
          <div key={fieldName} className="space-y-2">
            <label
              htmlFor={fieldName}
              className="block text-sm font-medium text-gray-700"
            >
              {field.label}
              {isRequired && (
                <span className="text-red-500 ml-1" aria-label="required">
                  *
                </span>
              )}
            </label>

            {field.type === 'text' && (
              <input
                id={fieldName}
                type="text"
                {...form.register(fieldName, {
                  required: isRequired ? `${field.label} is required` : false,
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-invalid={!!error}
                aria-describedby={error ? `${fieldName}-error` : undefined}
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                id={fieldName}
                {...form.register(fieldName, {
                  required: isRequired ? `${field.label} is required` : false,
                })}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-invalid={!!error}
                aria-describedby={error ? `${fieldName}-error` : undefined}
              />
            )}

            {field.type === 'checkbox' && (
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    id={fieldName}
                    type="checkbox"
                    {...form.register(fieldName)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {field.label}
                  </span>
                </label>
              </div>
            )}

            {field.type === 'date' && (
              <input
                id={fieldName}
                type="date"
                {...form.register(fieldName, {
                  required: isRequired ? `${field.label} is required` : false,
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-invalid={!!error}
                aria-describedby={error ? `${fieldName}-error` : undefined}
              />
            )}

            {field.type === 'select' && field.options && (
              <select
                id={fieldName}
                {...form.register(fieldName, {
                  required: isRequired ? `${field.label} is required` : false,
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-invalid={!!error}
                aria-describedby={error ? `${fieldName}-error` : undefined}
              >
                <option value="">Select an option...</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'radio' && field.options && (
              <div className="space-y-2">
                {field.options.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      {...form.register(fieldName, {
                        required: isRequired ? `${field.label} is required` : false,
                      })}
                      className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}

            {error && (
              <p
                id={`${fieldName}-error`}
                className="text-sm text-red-600"
                role="alert"
              >
                {String(error.message)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

