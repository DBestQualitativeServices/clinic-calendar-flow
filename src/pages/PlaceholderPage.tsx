import React from 'react';
import { useLocation } from 'react-router-dom';

const titles: Record<string, string> = {
  '/patients': 'Pacienți',
  '/consultations': 'Consulturi',
  '/settings': 'Setări',
};

export default function PlaceholderPage() {
  const location = useLocation();
  const title = titles[location.pathname] || 'Pagină';

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-muted-foreground">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-sm">Această pagină va fi disponibilă în curând.</p>
    </div>
  );
}
