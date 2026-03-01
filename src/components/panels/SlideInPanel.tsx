import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SlideInPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function SlideInPanel({ open, onClose, title, children }: SlideInPanelProps) {
  return (
    <>
      {/* Backdrop - subtle, click to close */}
      {open && <div className="fixed inset-0 z-30 bg-foreground/5" onClick={onClose} />}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-40 h-full bg-card border-l border-border shadow-xl flex flex-col",
          "transition-transform duration-300 ease-out",
          "w-[420px] max-w-[90vw]",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </>
  );
}
