import React from 'react';
import { useFormsStatus } from '@/hooks/mock';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface FormsStatusBadgeProps {
  appointmentId: string;
  className?: string;
}

export default function FormsStatusBadge({ appointmentId, className }: FormsStatusBadgeProps) {
  const { data: status } = useFormsStatus(appointmentId);

  if (status.total === 0) return null;

  const allDone = status.completed === status.total;
  const noneDone = status.completed === 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full',
        allDone && 'bg-emerald-500/20 text-emerald-700',
        !allDone && !noneDone && 'bg-amber-500/20 text-amber-700',
        noneDone && 'bg-red-500/20 text-red-700',
        className,
      )}
    >
      {status.completed}/{status.total}
      {allDone && <Check className="h-2.5 w-2.5" />}
    </span>
  );
}
