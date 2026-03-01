import React, { useState, useMemo } from 'react';
import { useAppState, type PanelType } from '@/store/appStore';
import { patients as allPatients, doctors, categories, consultationTypes } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Search, X, Plus, User, Calendar, Clock, Send } from 'lucide-react';
import { formatDuration, getConsultationName, minutesToTime, timeToMinutes, generateTimeSlots } from '@/lib/calendar-utils';
import type { Appointment, AppointmentPatient, AppointmentConsultation } from '@/types';

interface BookingPanelProps {
  prefill?: PanelType & { type: 'booking' };
}

interface PatientEntry {
  patientId: string | null;
  isNew: boolean;
  newName: string;
  newPhone: string;
  newDob: string;
  consultations: { categoryId: string; typeId: string; duration: number }[];
}

function createEmptyPatientEntry(): PatientEntry {
  return { patientId: null, isNew: false, newName: '', newPhone: '', newDob: '', consultations: [] };
}

export default function BookingPanel({ prefill }: BookingPanelProps) {
  const { addAppointment, appointments, timeBlocks, setActivePanel, calendar } = useAppState();
  const pf = prefill?.prefill;

  // Patient entries (multi-patient support)
  const [patientEntries, setPatientEntries] = useState<PatientEntry[]>([createEmptyPatientEntry()]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchIdx, setActiveSearchIdx] = useState(0);

  // Scheduling
  const [specificDoctor, setSpecificDoctor] = useState(!!pf?.doctorId);
  const [selectedDoctorId, setSelectedDoctorId] = useState(pf?.doctorId || '');
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(pf?.date || calendar.selectedDate);
  const [selectedTime, setSelectedTime] = useState(pf?.startTime || '');
  const [sendSms, setSendSms] = useState(true);

  // Recurring
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFreq, setRecurringFreq] = useState('weekly');
  const [recurringCount, setRecurringCount] = useState('4');

  // Search patients
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return allPatients.filter(p =>
      `${p.lastName} ${p.firstName}`.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.cnp?.includes(q)
    ).slice(0, 5);
  }, [searchQuery]);

  // Compute total duration
  const totalDuration = useMemo(() =>
    patientEntries.reduce((sum, pe) => sum + pe.consultations.reduce((s, c) => s + c.duration, 0), 0),
  [patientEntries]);

  // Eligible doctors (those having all required categories)
  const requiredCategories = useMemo(() => {
    const cats = new Set<string>();
    patientEntries.forEach(pe => pe.consultations.forEach(c => cats.add(c.categoryId)));
    return cats;
  }, [patientEntries]);

  const eligibleDoctors = useMemo(() =>
    doctors.filter(d => !d.isOnVacation && [...requiredCategories].every(cat => d.categoryIds.includes(cat))),
  [requiredCategories]);

  // Available slots
  const availableSlots = useMemo(() => {
    if (totalDuration === 0) return [];
    const targetDocs = specificDoctor && selectedDoctorId ? [doctors.find(d => d.id === selectedDoctorId)!].filter(Boolean) : eligibleDoctors;
    const slots: { date: string; time: string; doctorId: string; doctorName: string }[] = [];
    const timeSlots = generateTimeSlots();

    // Check next 14 days
    for (let dayOffset = 0; dayOffset < 14 && slots.length < 10; dayOffset++) {
      const d = new Date(selectedDate + 'T00:00:00');
      d.setDate(d.getDate() + dayOffset);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0) continue; // Sunday

      for (const doc of targetDocs) {
        for (const slot of timeSlots) {
          const startMin = timeToMinutes(slot);
          const endMin = startMin + totalDuration;
          if (endMin > 1080) continue; // past 18:00

          // Check overlaps with existing appointments
          const hasOverlap = appointments.some(a =>
            a.doctorId === doc.id && a.date === dateStr && a.startTime && a.status !== 'anulat' &&
            timeToMinutes(a.startTime) < endMin && timeToMinutes(a.startTime) + a.totalDurationMinutes > startMin
          );

          // Check overlaps with time blocks
          const hasBlock = timeBlocks.some(tb =>
            tb.doctorId === doc.id && tb.date === dateStr &&
            timeToMinutes(tb.startTime) < endMin && timeToMinutes(tb.startTime) + tb.durationMinutes > startMin
          );

          if (!hasOverlap && !hasBlock) {
            slots.push({ date: dateStr, time: slot, doctorId: doc.id, doctorName: doc.name });
            if (slots.length >= 10) break;
          }
        }
        if (slots.length >= 10) break;
      }
    }
    return slots;
  }, [totalDuration, specificDoctor, selectedDoctorId, eligibleDoctors, selectedDate, appointments, timeBlocks]);

  const selectPatient = (idx: number, patientId: string) => {
    setPatientEntries(prev => prev.map((pe, i) => i === idx ? { ...pe, patientId, isNew: false } : pe));
    setSearchQuery('');
  };

  const addConsultation = (idx: number, categoryId: string, typeId: string) => {
    const ct = consultationTypes.find(c => c.id === typeId);
    if (!ct) return;
    setPatientEntries(prev => prev.map((pe, i) => i === idx
      ? { ...pe, consultations: [...pe.consultations, { categoryId, typeId, duration: ct.defaultDurationMinutes }] }
      : pe
    ));
  };

  const removeConsultation = (pIdx: number, cIdx: number) => {
    setPatientEntries(prev => prev.map((pe, i) => i === pIdx
      ? { ...pe, consultations: pe.consultations.filter((_, j) => j !== cIdx) }
      : pe
    ));
  };

  const handleConfirm = () => {
    if (patientEntries.every(pe => !pe.patientId && !pe.isNew)) {
      toast({ title: 'Selectează cel puțin un pacient', variant: 'destructive' });
      return;
    }
    if (totalDuration === 0) {
      toast({ title: 'Adaugă cel puțin un consult', variant: 'destructive' });
      return;
    }
    const doctorId = selectedDoctorId || (availableSlots[0]?.doctorId ?? eligibleDoctors[0]?.id);
    if (!doctorId) {
      toast({ title: 'Niciun doctor disponibil', variant: 'destructive' });
      return;
    }

    const aptPatients: AppointmentPatient[] = patientEntries
      .filter(pe => pe.patientId || pe.isNew)
      .map(pe => ({
        patientId: pe.patientId || `p-new-${Date.now()}`,
        consultations: pe.consultations.map(c => ({
          consultationTypeId: c.typeId,
          durationMinutes: c.duration,
        })),
      }));

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      doctorId,
      date: selectedDate,
      startTime: isWalkIn ? undefined : (selectedTime || undefined),
      totalDurationMinutes: totalDuration,
      patients: aptPatients,
      status: 'programat',
      isWalkIn: isWalkIn || undefined,
      smsConfirmationSent: sendSms,
      createdAt: new Date().toISOString(),
      timeline: [{ timestamp: new Date().toISOString(), action: 'Creat', actor: 'Recepție' }],
    };

    addAppointment(newApt);
    toast({ title: 'Programare creată cu succes!' });
    setActivePanel({ type: 'none' });
  };

  const isPrefilled = !!(pf?.doctorId && pf?.startTime);

  return (
    <div className="space-y-6">
      {/* SECTION 1 — Patient(s) */}
      {patientEntries.map((pe, idx) => (
        <div key={idx} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" />
              Pacient {patientEntries.length > 1 ? `#${idx + 1}` : ''}
            </h3>
            {idx > 0 && (
              <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive" onClick={() => setPatientEntries(prev => prev.filter((_, i) => i !== idx))}>
                Elimină
              </Button>
            )}
          </div>

          {pe.patientId ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent border border-border">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {allPatients.find(p => p.id === pe.patientId)?.lastName} {allPatients.find(p => p.id === pe.patientId)?.firstName}
                </p>
                <p className="text-xs text-muted-foreground">{allPatients.find(p => p.id === pe.patientId)?.phone}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPatientEntries(prev => prev.map((p, i) => i === idx ? createEmptyPatientEntry() : p))}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : pe.isNew ? (
            <div className="space-y-2 p-3 rounded-md bg-accent/50 border border-border">
              <Input placeholder="Nume complet *" className="h-8 text-xs" value={pe.newName} onChange={e => setPatientEntries(prev => prev.map((p, i) => i === idx ? { ...p, newName: e.target.value } : p))} />
              <Input placeholder="Data nașterii *" type="date" className="h-8 text-xs" value={pe.newDob} onChange={e => setPatientEntries(prev => prev.map((p, i) => i === idx ? { ...p, newDob: e.target.value } : p))} />
              <Input placeholder="Telefon *" className="h-8 text-xs" value={pe.newPhone} onChange={e => setPatientEntries(prev => prev.map((p, i) => i === idx ? { ...p, newPhone: e.target.value } : p))} />
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Caută pacient (nume, telefon, CNP)..."
                  className="h-8 text-xs pl-8"
                  value={activeSearchIdx === idx ? searchQuery : ''}
                  onFocus={() => setActiveSearchIdx(idx)}
                  onChange={e => { setActiveSearchIdx(idx); setSearchQuery(e.target.value); }}
                />
              </div>
              {activeSearchIdx === idx && searchResults.length > 0 && (
                <div className="border border-border rounded-md bg-popover shadow-md overflow-hidden">
                  {searchResults.map(p => (
                    <button key={p.id} className="w-full px-3 py-1.5 text-left text-xs hover:bg-accent transition-colors" onClick={() => selectPatient(idx, p.id)}>
                      <span className="font-medium">{p.lastName} {p.firstName}</span>
                      <span className="text-muted-foreground ml-2">{p.phone}</span>
                    </button>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => setPatientEntries(prev => prev.map((p, i) => i === idx ? { ...p, isNew: true } : p))}>
                <Plus className="h-3 w-3" /> Pacient nou
              </Button>
            </div>
          )}

          {/* Consultations for this patient */}
          <ConsultationSelector
            consultations={pe.consultations}
            onAdd={(catId, typeId) => addConsultation(idx, catId, typeId)}
            onRemove={(cIdx) => removeConsultation(idx, cIdx)}
          />
        </div>
      ))}

      {/* Add additional patient */}
      {patientEntries.length < 5 && (
        <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary" onClick={() => setPatientEntries(prev => [...prev, createEmptyPatientEntry()])}>
          <Plus className="h-3.5 w-3.5" /> Adaugă pacient la aceeași programare
        </Button>
      )}

      {/* Recurring */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <Checkbox id="recurring" checked={isRecurring} onCheckedChange={(v) => setIsRecurring(!!v)} />
          <Label htmlFor="recurring" className="text-xs font-medium">Programare recurentă</Label>
        </div>
        {isRecurring && (
          <div className="flex gap-2 ml-6">
            <Select value={recurringFreq} onValueChange={setRecurringFreq}>
              <SelectTrigger className="h-8 text-xs w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Săptămânal</SelectItem>
                <SelectItem value="biweekly">La 2 săptămâni</SelectItem>
                <SelectItem value="monthly">Lunar</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" min={2} max={12} value={recurringCount} onChange={e => setRecurringCount(e.target.value)} className="h-8 text-xs w-16" placeholder="Nr." />
            <span className="text-xs text-muted-foreground self-center">ședințe</span>
          </div>
        )}
      </div>

      {/* Total duration */}
      {totalDuration > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-sm">
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-medium">Durată totală estimată:</span>
          <span className="font-bold text-primary">{formatDuration(totalDuration)}</span>
        </div>
      )}

      {/* SECTION 4 — When */}
      <div className="space-y-3 pt-2 border-t border-border">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-primary" /> Când
        </h3>

        {isPrefilled && !isWalkIn ? (
          <div className="p-3 rounded-md bg-accent/50 border border-border">
            <p className="text-sm font-medium">{doctors.find(d => d.id === pf?.doctorId)?.name}</p>
            <p className="text-xs text-muted-foreground">{pf?.date} la {pf?.startTime}</p>
            <Button variant="link" size="sm" className="text-xs p-0 h-auto mt-1" onClick={() => { setSelectedDoctorId(''); setSelectedTime(''); }}>
              Schimbă
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch checked={specificDoctor} onCheckedChange={setSpecificDoctor} id="specific-doctor" />
                <Label htmlFor="specific-doctor" className="text-xs">{specificDoctor ? 'Doctor specific' : 'Orice doctor disponibil'}</Label>
              </div>
            </div>

            {specificDoctor && (
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Alege doctor..." /></SelectTrigger>
                <SelectContent>
                  {eligibleDoctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center gap-2">
              <Checkbox id="walkin" checked={isWalkIn} onCheckedChange={(v) => setIsWalkIn(!!v)} />
              <Label htmlFor="walkin" className="text-xs">Fără oră fixă (walk-in)</Label>
            </div>

            {isWalkIn ? (
              <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="h-8 text-xs" />
            ) : (
              totalDuration > 0 && (
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {availableSlots.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">Niciun slot disponibil în următoarele 2 săptămâni.</p>
                  ) : (
                    availableSlots.map((slot, i) => (
                      <button
                        key={i}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-xs transition-colors border",
                          selectedTime === slot.time && selectedDate === slot.date && selectedDoctorId === slot.doctorId
                            ? "bg-primary/10 border-primary text-primary font-medium"
                            : "bg-card border-border hover:bg-accent"
                        )}
                        onClick={() => { setSelectedTime(slot.time); setSelectedDate(slot.date); setSelectedDoctorId(slot.doctorId); }}
                      >
                        <span className="font-medium">{slot.date}</span>
                        <span className="mx-1.5">·</span>
                        <span>{slot.time} — {minutesToTime(timeToMinutes(slot.time) + totalDuration)}</span>
                        <span className="mx-1.5">·</span>
                        <span className="text-muted-foreground">{slot.doctorName}</span>
                      </button>
                    ))
                  )}
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* SECTION 5 — Confirmation */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-muted-foreground" />
            <Label className="text-xs">Trimite SMS de confirmare</Label>
          </div>
          <Switch checked={sendSms} onCheckedChange={setSendSms} />
        </div>

        <Button className="w-full font-semibold" onClick={handleConfirm} disabled={totalDuration === 0}>
          Confirmă programarea
        </Button>
      </div>
    </div>
  );
}

// Sub-component: Consultation selector
function ConsultationSelector({
  consultations,
  onAdd,
  onRemove,
}: {
  consultations: { categoryId: string; typeId: string; duration: number }[];
  onAdd: (catId: string, typeId: string) => void;
  onRemove: (idx: number) => void;
}) {
  const [selCat, setSelCat] = useState('');
  const [selType, setSelType] = useState('');

  const filteredTypes = useMemo(() =>
    consultationTypes.filter(ct => ct.categoryId === selCat),
  [selCat]);

  const handleAdd = () => {
    if (selCat && selType) {
      onAdd(selCat, selType);
      setSelCat('');
      setSelType('');
    }
  };

  return (
    <div className="space-y-2">
      {/* Existing consultations */}
      {consultations.map((c, i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-1 rounded bg-muted text-xs">
          <span className="flex-1 font-medium">{getConsultationName(c.typeId)} — {formatDuration(c.duration)}</span>
          <button onClick={() => onRemove(i)} className="text-destructive hover:text-destructive/80"><X className="h-3 w-3" /></button>
        </div>
      ))}

      {/* Add new */}
      <div className="flex gap-1.5 items-end">
        <div className="flex-1">
          <Select value={selCat} onValueChange={(v) => { setSelCat(v); setSelType(''); }}>
            <SelectTrigger className="h-7 text-[11px]"><SelectValue placeholder="Categorie..." /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={selType} onValueChange={setSelType} disabled={!selCat}>
            <SelectTrigger className="h-7 text-[11px]"><SelectValue placeholder="Consult..." /></SelectTrigger>
            <SelectContent>
              {filteredTypes.map(ct => <SelectItem key={ct.id} value={ct.id}>{ct.name} ({ct.defaultDurationMinutes}m)</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-[11px] px-2" onClick={handleAdd} disabled={!selType}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
