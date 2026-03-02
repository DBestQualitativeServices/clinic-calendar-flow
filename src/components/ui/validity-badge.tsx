import { cn } from '@/lib/utils';

interface ValidityBadgeProps {
  valid: boolean;
  className?: string;
}

export default function ValidityBadge({ valid, className }: ValidityBadgeProps) {
  return (
    <span className={cn(
      'text-[10px] font-bold px-2 py-0.5 rounded-full',
      valid
        ? 'bg-status-valid/20 text-status-valid-foreground'
        : 'bg-muted text-muted-foreground',
      className,
    )}>
      {valid ? 'Valid' : 'Expirat'}
    </span>
  );
}
