import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PdfField } from '../types';

interface FieldEditorProps {
  fields: PdfField[];
  onFieldUpdate: (index: number, updates: Partial<PdfField>) => void;
  onReorder: (fields: PdfField[]) => void;
}

function SortableFieldItem({
  field,
  index: _index,
  onUpdate,
}: {
  field: PdfField;
  index: number;
  onUpdate: (updates: Partial<PdfField>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-md p-4 mb-2"
    >
      <div className="flex items-start gap-4">
        <button
          {...attributes}
          {...listeners}
          className="mt-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          aria-label="Drag to reorder"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Name
            </label>
            <input
              type="text"
              value={field.name}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={field.type}
              onChange={(e) => onUpdate({ type: e.target.value as PdfField['type'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="text">Text</option>
              <option value="textarea">Textarea</option>
              <option value="checkbox">Checkbox</option>
              <option value="radio">Radio</option>
              <option value="select">Select</option>
              <option value="date">Date</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Value
            </label>
            {field.type === 'checkbox' ? (
              <input
                type="checkbox"
                checked={field.defaultValue === true}
                onChange={(e) => onUpdate({ defaultValue: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            ) : (
              <input
                type="text"
                value={String(field.defaultValue || '')}
                onChange={(e) => onUpdate({ defaultValue: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                maxLength={1000}
              />
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Required</span>
            </label>
          </div>
        </div>
      </div>

      {(field.type === 'select' || field.type === 'radio') && field.options && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options
          </label>
          <div className="space-y-2">
            {field.options.map((opt, optIdx) => (
              <div key={optIdx} className="flex gap-2">
                <input
                  type="text"
                  value={opt.value}
                  disabled
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => {
                    const newOptions = [...field.options!];
                    newOptions[optIdx] = { ...opt, label: e.target.value };
                    onUpdate({ options: newOptions });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  maxLength={200}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FieldEditor({ fields, onFieldUpdate, onReorder }: FieldEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.name === active.id);
      const newIndex = fields.findIndex((f) => f.name === over.id);
      const newFields = arrayMove(fields, oldIndex, newIndex);
      onReorder(newFields);
    }
  };

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Fields ({fields.length})
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Drag fields to reorder. Changes are saved automatically.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedFields.map((f) => f.name)}
          strategy={verticalListSortingStrategy}
        >
          {sortedFields.map((field, index) => (
            <SortableFieldItem
              key={field.name}
              field={field}
              index={index}
              onUpdate={(updates) => onFieldUpdate(index, updates)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

