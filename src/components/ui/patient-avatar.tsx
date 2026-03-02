import { cn } from '@/lib/utils';

interface PatientAvatarProps {
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md';
  className?: string;
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
};

export default function PatientAvatar({ firstName, lastName, size = 'md', className }: PatientAvatarProps) {
  return (
    <div className={cn(
      'rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0',
      sizes[size],
      className,
    )}>
      {lastName[0]}{firstName[0]}
    </div>
  );
}
