import React, { useState, useEffect } from 'react';
import { useAppointmentById, useDoctors, usePatientById, useConsultationTypes, useCategories, useUpdateAppointmentStatus, useFormsStatus } from '@/hooks/data';
import { useMockData } from '@/hooks/mock/MockDataProvider';
import { useUIState } from '@/store/uiStore';
import { formatPatientName, formatDuration } from '@/lib/calendar-utils';
import { STATUS_CONFIG } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LogIn, Play, CheckCircle, RotateCcw, X, FileText, Plus, Minus, Tablet, AlertTriangle } from 'lucide-react';
import type { AppointmentStatus, AppointmentConsultation } from '@/types';
import FinalizationModal from '@/components/modals/FinalizationModal';
import FormsStatusPanel from '@/components/forms/FormsStatusPanel';

function PatientBlock({ patientId, consultations, isInConsult, onDurationChange }: {
  patientId: string;
  consultations: { consultationTypeId: string; durationMinutes: number }[];
  isInConsult?: boolean;
  onDurationChange?: (idx: number, delta: number) => void;
}) {
  const { data: patient } = usePatientById(patientId);
  const { data: consultationTypes } = useConsultationTypes();

  return (
    <div className="p-3 rounded-md bg-accent/50 border border-border space-y-1.5">
      <p className="text-sm font-bold">{patient ? `${patient.lastName} ${patient.firstName}` : patientId}</p>
      <p className="text-xs text-muted-foreground">{patient?.phone} · {patient?.dateOfBirth}</p>
      {consultations.map((c, ci) => {
        const ct = consultationTypes.find(t => t.id === c.consultationTypeId);
        return (
          <div key={ci} className="flex items-center justify-between text-xs">
            <span>{ct?.name || c.consultationTypeId}</span>
            {isInConsult && onDurationChange ? (
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-5 w-5" onClick={() => onDurationChange(ci, -5)} disabled={c.durationMinutes <= 5}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="font-medium w-10 text-center">{formatDuration(c.durationMinutes)}</span>
                <Button variant="outline" size="icon" className="h-5 w-5" onClick={() => onDurationChange(ci, 5)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <span className="text-muted-foreground">{formatDuration(c.durationMinutes)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PatientTabletCode({ appointmentId, patientId }: { appointmentId: string; patientId: string }) {
  const { tabletSessions } = useMockData();
  const session = tabletSessions.find(s => s.appointmentId === appointmentId && s.patientId === patientId && s.active);
  if (!session) return null;
  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded bg-primary/10 border border-primary/20">
      <Tablet className="h-3.5 w-3.5 text-primary" />
      <span className="text-xs font-bold tracking-widest text-primary">{session.accessCode}</span>
    </div>
  );
}

export default function AppointmentDetailsPanel({ appointmentId }: { appointmentId: string }) {
  const { data: apt } = useAppointmentById(appointmentId);
  const { data: doctors } = useDoctors();
  const { data: allConsultationTypes } = useConsultationTypes();
  const { data: categories } = useCategories();
  const { mutate: updateStatus } = useUpdateAppointmentStatus();
  const { setActivePanel, setSecondaryPanel, secondaryPanel } = useUIState();
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountNote, setDiscountNote] = useState('');

  // Auto-open consult form when appointment is in_consult
  useEffect(() => {
    if (apt?.status === 'in_consult') {
      setSecondaryPanel({ type: 'consultForm', appointmentId });
    }
  }, [apt?.status, appointmentId, setSecondaryPanel]);

  if (!apt) return <p className="text-sm text-muted-foreground p-4">Programarea nu a fost găsită.</p>;

  const doctor = doctors.find(d => d.id === apt.doctorId);
  const badge = STATUS_CONFIG[apt.status];
  const now = new Date().toISOString();
  const isInConsult = apt.status === 'in_consult';

  // Consultation types the doctor can add (from their categories)
  const doctorCategoryIds = doctor?.categoryIds || [];
  const availableConsultTypes = allConsultationTypes.filter(ct => doctorCategoryIds.includes(ct.categoryId));
  const existingTypeIds = apt.patients.flatMap(p => p.consultations.map(c => c.consultationTypeId));

  const transition = (status: AppointmentStatus, action: string) => {
    updateStatus({
      appointmentId: apt.id,
      update: {
        status,
        timeline: [...apt.timeline, { timestamp: now, action, actor: 'Recepție' }],
      },
    });
    toast({ title: `Status schimbat: ${STATUS_CONFIG[status].label}` });
  };

  const handleDurationChange = (patientIdx: number, consultIdx: number, delta: number) => {
    const newPatients = apt.patients.map((p, pi) => {
      if (pi !== patientIdx) return p;
      const newConsults = p.consultations.map((c, ci) => {
        if (ci !== consultIdx) return c;
        return { ...c, durationMinutes: Math.max(5, c.durationMinutes + delta) };
      });
      return { ...p, consultations: newConsults };
    });
    const newTotal = newPatients.reduce((sum, p) => sum + p.consultations.reduce((s, c) => s + c.durationMinutes, 0), 0);
    updateStatus({ appointmentId: apt.id, update: { patients: newPatients, totalDurationMinutes: newTotal } });
  };

  const handleAddConsultation = (consultationTypeId: string) => {
    const ct = allConsultationTypes.find(t => t.id === consultationTypeId);
    if (!ct) return;
    const duration = doctor?.durationOverrides?.[consultationTypeId] ?? ct.defaultDurationMinutes;
    // Add to first patient
    const newPatients = apt.patients.map((p, i) => {
      if (i !== 0) return p;
      return { ...p, consultations: [...p.consultations, { consultationTypeId, durationMinutes: duration }] };
    });
    const newTotal = newPatients.reduce((sum, p) => sum + p.consultations.reduce((s, c) => s + c.durationMinutes, 0), 0);
    updateStatus({ appointmentId: apt.id, update: { patients: newPatients, totalDurationMinutes: newTotal } });
    toast({ title: `Consultație adăugată: ${ct.name}` });
  };

  const handleRemoveConsultation = (patientIdx: number, consultIdx: number) => {
    const newPatients = apt.patients.map((p, pi) => {
      if (pi !== patientIdx) return p;
      const newConsults = p.consultations.filter((_, ci) => ci !== consultIdx);
      return { ...p, consultations: newConsults };
    });
    if (newPatients.some(p => p.consultations.length === 0)) {
      toast({ title: 'Trebuie cel puțin o consultație', variant: 'destructive' });
      return;
    }
    const newTotal = newPatients.reduce((sum, p) => sum + p.consultations.reduce((s, c) => s + c.durationMinutes, 0), 0);
    updateStatus({ appointmentId: apt.id, update: { patients: newPatients, totalDurationMinutes: newTotal } });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className={cn('text-xs px-3 py-1 rounded-full font-semibold', badge.cls)}>{badge.label}</span>
        <span className="text-xs text-muted-foreground">{apt.date} · {apt.startTime || 'Walk-in'}</span>
      </div>

      {/* Patient tablet codes — visible throughout consultation */}
      {(isInConsult || apt.status === 'sosit') && apt.patients.map(ap => (
        <PatientTabletCode key={ap.patientId} appointmentId={apt.id} patientId={ap.patientId} />
      ))}

      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Doctor</p>
        <p className="text-sm font-semibold">{doctor?.name}</p>
      </div>

      {apt.patients.map((ap, idx) => (
        <div key={idx} className="space-y-1.5">
          <PatientBlock
            patientId={ap.patientId}
            consultations={ap.consultations}
            isInConsult={isInConsult}
            onDurationChange={(ci, delta) => handleDurationChange(idx, ci, delta)}
          />
          {isInConsult && ap.consultations.length > 1 && (
            <div className="flex flex-wrap gap-1">
              {ap.consultations.map((c, ci) => (
                <Button key={ci} variant="ghost" size="sm" className="h-5 text-[10px] text-destructive px-1.5" onClick={() => handleRemoveConsultation(idx, ci)}>
                  <X className="h-3 w-3 mr-0.5" /> {allConsultationTypes.find(t => t.id === c.consultationTypeId)?.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Add consultation during in_consult */}
      {isInConsult && (
        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Adaugă consultație</p>
          <Select onValueChange={handleAddConsultation}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Selectează tip consultație..." />
            </SelectTrigger>
            <SelectContent>
              {availableConsultTypes.map(ct => (
                <SelectItem key={ct.id} value={ct.id} className="text-xs">
                  {ct.name} ({formatDuration(ct.defaultDurationMinutes)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Durată totală</span>
        <span className="font-bold text-primary">{formatDuration(apt.totalDurationMinutes)}</span>
      </div>

      {/* Discount section — only during in_consult */}
      {isInConsult && (
        <div className="p-3 rounded-md border border-border space-y-2">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Discount / Spor</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => setDiscountAmount(prev => prev - 5)}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className={cn("text-sm font-bold w-16 text-center", discountAmount < 0 ? "text-destructive" : discountAmount > 0 ? "text-emerald-600" : "text-muted-foreground")}>
                {discountAmount > 0 ? `-${discountAmount}` : discountAmount < 0 ? `+${Math.abs(discountAmount)}` : '0'} RON
              </span>
              <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => setDiscountAmount(prev => prev + 5)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {discountAmount !== 0 && (
            <div>
              <Label className="text-[10px] text-muted-foreground">Observație (obligatorie)</Label>
              <Input className="h-7 text-xs mt-1" placeholder={discountAmount > 0 ? "Motiv discount..." : "Motiv spor complexitate..."} value={discountNote} onChange={e => setDiscountNote(e.target.value)} />
            </div>
          )}
          <p className="text-[10px] text-muted-foreground">
            {discountAmount > 0 ? 'Discount' : discountAmount < 0 ? 'Spor complexitate' : 'Fără ajustare'} — se aplică global pe sesiune
          </p>
        </div>
      )}

      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Istoric</p>
        <div className="space-y-1.5">
          {apt.timeline.map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <div>
                <span className="font-medium">{t.action}</span>
                {t.actor && <span className="text-muted-foreground ml-1">— {t.actor}</span>}
                <p className="text-[10px] text-muted-foreground">{new Date(t.timestamp).toLocaleString('ro-RO')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FormsStatusPanel appointmentId={apt.id} />

      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Note</p>
        <Textarea
          className="text-xs min-h-[60px]"
          placeholder="Adaugă observații..."
          value={apt.notes || ''}
          onChange={e =>
            updateStatus({
              appointmentId: apt.id,
              update: { notes: e.target.value },
            })
          }
        />
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        {apt.status === 'programat' && (
          <Button className="w-full gap-2" onClick={() => transition('sosit', 'Check-in')}>
            <LogIn className="h-4 w-4" /> Check-in
          </Button>
        )}
        {apt.status === 'sosit' && (
          <Button className="w-full gap-2" onClick={() => transition('in_consult', 'In consult (manual)')}>
            <Play className="h-4 w-4" /> Forțează "În consult"
          </Button>
        )}
         {apt.status === 'in_consult' && (
          <>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                // Toggle: close if already open, open if closed
                if (secondaryPanel.type === 'consultForm' && secondaryPanel.appointmentId === apt.id) {
                  setSecondaryPanel({ type: 'none' });
                } else {
                  setSecondaryPanel({ type: 'consultForm', appointmentId: apt.id });
                }
              }}
            >
              <FileText className="h-4 w-4" /> Scrisoare medicală
            </Button>
            <Button className="w-full gap-2" onClick={() => setFinalizeModalOpen(true)}>
              <CheckCircle className="h-4 w-4" /> Finalizează
            </Button>
          </>
        )}
        <FinalizationModal appointmentId={apt.id} open={finalizeModalOpen} onOpenChange={setFinalizeModalOpen} />

        {(apt.status === 'programat' || apt.status === 'no_show') && (
          <Button variant="outline" className="w-full gap-2 text-xs" onClick={() => setActivePanel({ type: 'booking', prefill: { appointment: apt } })}>
            <RotateCcw className="h-3.5 w-3.5" /> Reprogramează
          </Button>
        )}
        {(apt.status === 'programat' || apt.status === 'sosit') && (
          <Button variant="ghost" className="w-full gap-2 text-xs text-destructive" onClick={() => transition('anulat', 'Anulat')}>
            <X className="h-3.5 w-3.5" /> Anulează
          </Button>
        )}
      </div>
    </div>
  );
}
