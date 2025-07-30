import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from "lucide-react";

interface SortableWidgetProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function SortableWidget({ id, children, className = "" }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${className}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10 p-1 bg-white rounded shadow-sm border"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-gray-500" />
      </div>
      
      {children}
    </div>
  );
}