'use client';

import { ReactNode } from 'react';
import { GripVertical, Eye, EyeOff, Copy, Trash2, Settings } from 'lucide-react';

interface SectionWrapperProps {
  id: string;
  title: string;
  isSelected: boolean;
  isVisible: boolean;
  children: ReactNode;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSettings?: () => void;
  dragHandleProps?: any;
}

export function SectionWrapper({
  id,
  title,
  isSelected,
  isVisible,
  children,
  onSelect,
  onToggleVisibility,
  onDuplicate,
  onDelete,
  onSettings,
  dragHandleProps,
}: SectionWrapperProps) {
  return (
    <div
      className={`group relative bg-white border-2 rounded-lg transition-all ${
        isSelected
          ? 'border-orange-500 shadow-lg'
          : 'border-neutral-200 hover:border-neutral-300'
      } ${!isVisible ? 'opacity-50' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-50 border-b border-neutral-200 rounded-t-lg">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <button
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing p-1 text-neutral-400 hover:text-neutral-600"
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <span className="text-sm font-medium text-neutral-700">{title}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            className="p-1.5 text-neutral-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
            aria-label={isVisible ? 'Hide section' : 'Show section'}
          >
            {isVisible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>

          {onSettings && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSettings();
              }}
              className="p-1.5 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              aria-label="Section settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1.5 text-neutral-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            aria-label="Duplicate section"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this section?')) {
                onDelete();
              }
            }}
            className="p-1.5 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            aria-label="Delete section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Section Content */}
      <div className="p-4">{children}</div>
    </div>
  );
}
