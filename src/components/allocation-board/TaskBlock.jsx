import { useDraggable } from '@dnd-kit/core';
import { cn } from '../../lib/utils';
import { Clock } from 'lucide-react';

export function TaskBlock({ allocation, task, project, onClick, isDragging }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: allocation.id,
    data: { allocation, task, project },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  const bgColor = project?.color || '#6366f1';

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: `${bgColor}22`, borderColor: `${bgColor}66` }}
      {...listeners}
      {...attributes}
      onClick={(e) => { e.stopPropagation(); onClick(allocation, task, project); }}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs cursor-grab active:cursor-grabbing select-none transition-all',
        isDragging ? 'opacity-50 scale-95 shadow-lg' : 'hover:brightness-110 hover:shadow-md'
      )}
      title={task?.name}
    >
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: bgColor }} />
      <span className="text-slate-200 truncate flex-1 font-medium text-[11px]">{task?.name}</span>
      <span className="text-slate-400 flex items-center gap-0.5 flex-shrink-0 text-[10px]">
        <Clock className="w-2.5 h-2.5" />{allocation.hoursPerWeek}h
      </span>
    </div>
  );
}
