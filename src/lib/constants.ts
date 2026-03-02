import type { AppointmentStatus } from '@/types';

/** Unified status display config — single source of truth */
export const STATUS_CONFIG: Record<AppointmentStatus, { label: string; cls: string }> = {
  programat:  { label: 'Programat',   cls: 'bg-status-programat text-white' },
  sosit:      { label: 'Sosit',       cls: 'bg-status-sosit text-white' },
  in_consult: { label: 'În consult',  cls: 'bg-status-in-consult text-white' },
  finalizat:  { label: 'Finalizat',   cls: 'bg-status-finalizat text-foreground' },
  anulat:     { label: 'Anulat',      cls: 'bg-status-anulat text-foreground' },
  no_show:    { label: 'No-show',     cls: 'bg-status-no-show text-white' },
};
