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

/** Consultation type ID → CSS variable name (without --) */
export const CONSULT_COLORS: Record<string, string> = {
  'ct-dermapen': 'consult-dermapen',
  'ct-botox': 'consult-botox',
  'ct-acid-hialuronic': 'consult-acid-hialuronic',
  'ct-peeling': 'consult-peeling',
  'ct-chirurgie': 'consult-chirurgie',
  'ct-dermatoscopie': 'consult-dermatoscopie',
  'ct-crioterapie': 'consult-crioterapie',
  'ct-biopsie': 'consult-biopsie',
  'ct-consultatie': 'consult-consultatie',
  'ct-control': 'consult-control',
  'ct-gdpr': 'consult-gdpr',
};

/** Get HSL color string for a consultation type */
export function getConsultColor(consultationTypeId: string): string {
  const varName = CONSULT_COLORS[consultationTypeId];
  return varName ? `hsl(var(--${varName}))` : 'hsl(var(--muted-foreground))';
}
