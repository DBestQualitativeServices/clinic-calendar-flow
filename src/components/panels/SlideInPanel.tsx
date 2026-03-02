import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SlideInPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** When true, panel shifts left to make room for a secondary panel */
  pushed?: boolean;
  /** z-index layer */
  zIndex?: number;
}

export default function SlideInPanel({ open, onClose, title, children, pushed, zIndex = 40 }: SlideInPanelProps) {
  return (
    <>
      {/* Backdrop - only for the base layer */}
      {open && zIndex <= 40 && <div className="fixed inset-0 z-30 bg-foreground/5" onClick={onClose} />}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 h-full bg-card border-l border-border shadow-xl flex flex-col",
          "transition-all duration-300 ease-out",
          "w-[420px] max-w-[90vw]",
        )}
        style={{
          zIndex,
          right: open && pushed ? '420px' : '0px',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
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
