import React, { useState, useEffect, useMemo } from 'react';
import { useAppointmentById, useDoctors, usePatientById, useConsultationTypes, useCategories, useUpdateAppointmentStatus, useFormsStatusForPatient, usePatientAppointments } from '@/hooks/data';
import { useTabletCode } from '@/hooks/useTabletCode';
import { useUIState } from '@/store/uiStore';
import { formatPatientName, formatDuration } from '@/lib/calendar-utils';
import { STATUS_CONFIG } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LogIn, Play, CheckCircle, RotateCcw, X, FileText, Plus, Minus, Tablet, AlertTriangle, Calendar, ChevronDown, RefreshCw } from 'lucide-react';
import type { AppointmentStatus } from '@/types';
import FinalizationModal from '@/components/modals/FinalizationModal';
import FormsStatusPanel from '@/components/forms/FormsStatusPanel';

function PatientBlock({ patientId, consultations, isInConsult, onDurationChange, discountAmount }: {
  patientId: string;
  consultations: { consultationTypeId: string; durationMinutes: number }[];
  isInConsult?: boolean;
  onDurationChange?: (idx: number, delta: number) => void;
  discountAmount?: number;
}) {
  const { data: consultationTypes } = useConsultationTypes();

  const prices = consultations.map(c => {
    const ct = consultationTypes.find(t => t.id === c.consultationTypeId);
    return ct?.priceRON ?? 0;
  });
  const subtotal = prices.reduce((s, p) => s + p, 0);
  const total = subtotal - (discountAmount ?? 0);

  return (
    <div className="p-3 rounded-md bg-accent/50 border border-border space-y-1.5">
      {consultations.map((c, ci) => {
        const ct = consultationTypes.find(t => t.id === c.consultationTypeId);
        return (
          <div key={ci} className="flex items-center justify-between text-xs">
            <span className="flex-1">{ct?.name || c.consultationTypeId}</span>
            <span className="text-muted-foreground w-16 text-right mr-2">{prices[ci]} RON</span>
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
              <span className="text-muted-foreground w-10 text-right">{formatDuration(c.durationMinutes)}</span>
            )}
          </div>
        );
      })}
      <div className="border-t border-border pt-1.5 mt-1.5">
        {(discountAmount ?? 0) !== 0 && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Subtotal</span>
            <span>{subtotal} RON</span>
          </div>
        )}
        {(discountAmount ?? 0) !== 0 && (
          <div className={cn("flex justify-between text-xs", (discountAmount ?? 0) > 0 ? "text-emerald-600" : "text-destructive")}>
            <span>{(discountAmount ?? 0) > 0 ? 'Discount' : 'Spor complexitate'}</span>
            <span>{(discountAmount ?? 0) > 0 ? `-${discountAmount}` : `+${Math.abs(discountAmount ?? 0)}`} RON</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold">
          <span>Total</span>
          <span className="text-primary">{total} RON</span>
        </div>
      </div>
    </div>
  );
}

function PatientHeader({ appointmentId, patientId, formsReady, onRefreshForms }: { appointmentId: string; patientId: string; formsReady: boolean; onRefreshForms?: () => void }) {
  const { data: patient } = usePatientById(patientId);
  const { session, generate } = useTabletCode(appointmentId, patientId);


  if (!patient) return null;

  return (
    <div className={cn(
      "p-3 rounded-md border",
      !formsReady ? "border-destructive/50 bg-destructive/5" : "border-border bg-accent/50"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-sm font-bold">{patient.lastName} {patient.firstName}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{patient.dateOfBirth}</span>
            <span>{patient.phone}</span>
          </div>
          {!formsReady && (
            <div className="flex items-center gap-1.5 mt-1">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              <span className="text-[10px] font-semibold text-destructive">Formulare incomplete!</span>
              {onRefreshForms && (
                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={onRefreshForms}>
                  <RefreshCw className="h-3 w-3 text-destructive" />
                </Button>
              )}
            </div>
          )}
        </div>
        {session ? (
          <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-md bg-primary/10 border border-primary/30 flex-shrink-0">
            <Tablet className="h-4 w-4 text-primary" />
            <span className="text-lg font-bold tracking-[0.25em] text-primary leading-none">{session.accessCode}</span>
            <span className="text-[8px] text-primary/60 uppercase">cod tabletă</span>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="text-xs gap-1.5 flex-shrink-0" onClick={generate}>
            <Tablet className="h-3.5 w-3.5" /> Cod tabletă
          </Button>
        )}
      </div>
      {formsReady && onRefreshForms && (
        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 mt-1 text-muted-foreground" onClick={onRefreshForms}>
          <RefreshCw className="h-3 w-3" /> Sincronizează formulare
        </Button>
      )}
    </div>
  );
}

function PastConsultations({ patientId, currentAppointmentId }: { patientId: string; currentAppointmentId: string }) {
  const { data: appointments } = usePatientAppointments(patientId);
  const { data: consultationTypes } = useConsultationTypes();
  const { setSecondaryPanel } = useUIState();

  const pastFinalized = useMemo(() =>
    appointments.filter(a => a.id !== currentAppointmentId && a.status === 'finalizat').slice(0, 5),
    [appointments, currentAppointmentId]
  );

  if (pastFinalized.length === 0) return null;

  return (
    <div>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Scrisori medicale anterioare</p>
      <div className="space-y-1">
        {pastFinalized.map(a => (
          <button
            key={a.id}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-accent/30 border border-border hover:bg-accent/60 transition-colors text-left"
            onClick={() => setSecondaryPanel({ type: 'consultForm', appointmentId: a.id })}
          >
            <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">{a.date} · {a.startTime || 'Walk-in'}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {a.patients.flatMap(p => p.consultations.map(c => {
                  const ct = consultationTypes.find(t => t.id === c.consultationTypeId);
                  return ct?.name ?? c.consultationTypeId;
                })).join(', ')}
              </p>
            </div>
            <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          </button>
        ))}
      </div>
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
  const [formsRefreshKey, setFormsRefreshKey] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const getFormsStatus = useFormsStatusForPatient();

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
  

  const doctorCategoryIds = doctor?.categoryIds || [];
  const availableConsultTypes = allConsultationTypes.filter(ct => doctorCategoryIds.includes(ct.categoryId));

  const patientFormsReady = apt.patients.map(ap => {
    const status = getFormsStatus(ap.patientId, ap.consultations.map(c => c.consultationTypeId));
    return status.completed >= status.total;
  });

  const handleRefreshForms = () => {
    setFormsRefreshKey(k => k + 1);
    toast({ title: 'Formulare resincronizate' });
  };

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

      {apt.patients.map((ap, idx) => (
        <div key={idx} className="space-y-1.5">
          <PatientHeader
              appointmentId={apt.id}
              patientId={ap.patientId}
              formsReady={patientFormsReady[idx]}
              onRefreshForms={handleRefreshForms}
          />
          <PatientBlock
            patientId={ap.patientId}
            consultations={ap.consultations}
            isInConsult={isInConsult}
            onDurationChange={(ci, delta) => handleDurationChange(idx, ci, delta)}
            discountAmount={isInConsult ? discountAmount : undefined}
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
                  {ct.name} ({ct.priceRON} RON · {formatDuration(ct.defaultDurationMinutes)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isInConsult && (
        <div className="p-3 rounded-md border border-border space-y-2">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider text-center">Discount / Spor</p>
          <div className="flex items-center justify-center gap-2">
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
        </div>
      )}

      {/* Collapsible timeline */}
      <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 w-full group">
          <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", historyOpen && "rotate-180")} />
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Istoric ({apt.timeline.length})</p>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
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
        </CollapsibleContent>
      </Collapsible>

      <FormsStatusPanel key={formsRefreshKey} appointmentId={apt.id} />

      {apt.patients[0] && (
        <PastConsultations patientId={apt.patients[0].patientId} currentAppointmentId={apt.id} />
      )}

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
