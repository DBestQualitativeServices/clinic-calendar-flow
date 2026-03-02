interface SectionHeaderProps {
  children: React.ReactNode;
  count?: number;
}

export default function SectionHeader({ children, count }: SectionHeaderProps) {
  return (
    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">
      {children}{count !== undefined && ` (${count})`}
    </p>
  );
}
