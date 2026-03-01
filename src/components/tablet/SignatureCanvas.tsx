import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';

interface SignatureCanvasProps {
  label?: string;
  onSignatureChange: (dataUrl: string | null) => void;
}

export default function SignatureCanvas({ label = 'Semnătura pacient', onSignatureChange }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getCtx = () => canvasRef.current?.getContext('2d') ?? null;

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = getCtx();
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'hsl(0, 0%, 20%)';
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setHasSignature(true);
      const dataUrl = canvasRef.current?.toDataURL('image/png') || null;
      onSignatureChange(dataUrl);
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getCtx();
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resizeCanvas();
    setHasSignature(false);
    onSignatureChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold">{label}</p>
        <Button variant="outline" size="sm" className="text-sm h-10 gap-2" onClick={clear}>
          <Eraser className="h-4 w-4" /> Șterge semnătura
        </Button>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full border-2 border-dashed border-border rounded-lg bg-white cursor-crosshair touch-none"
          style={{ height: '300px' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!hasSignature && (
          <p className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm pointer-events-none">
            Semnați cu degetul în spațiul de mai sus
          </p>
        )}
      </div>
    </div>
  );
}
