import React, { useState, useMemo } from 'react';
import { useUIState, type PanelType } from '@/store/uiStore';
import { usePatients, useDoctors, useCategories, useConsultationTypes, useCreateAppointment, useAvailableSlots } from '@/hooks/mock';
import { usePatientById } from '@/hooks/mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Search, X, Plus, User, Calendar, Clock, Send } from 'lucide-react';
import { formatDuration, minutesToTime, timeToMinutes } from '@/lib/calendar-utils';
import type { Appointment, AppointmentPatient } from '@/types';

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
  const { setActivePanel, calendar } = useUIState();
  const { mutate: addAppointment } = useCreateAppointment();
  const { data: doctors } = useDoctors();
  const { data: categories } = useCategories();
  const { data: allConsultationTypes } = useConsultationTypes();
  const pf = prefill?.prefill;

  const [patientEntries, setPatientEntries] = useState<PatientEntry[]>([createEmptyPatientEntry()]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchIdx, setActiveSearchIdx] = useState(0);

  const [specificDoctor, setSpecificDoctor] = useState(!!pf?.doctorId);
  const [selectedDoctorId, setSelectedDoctorId] = useState(pf?.doctorId || '');
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(pf?.date || calendar.selectedDate);
  const [selectedTime, setSelectedTime] = useState(pf?.startTime || '');
  const [sendSms, setSendSms] = useState(true);

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFreq, setRecurringFreq] = useState('weekly');
  const [recurringCount, setRecurringCount] = useState('4');

  const { data: searchResults } = usePatients(activeSearchIdx >= 0 ? searchQuery : undefined);
  const filteredSearchResults = useMemo(() => (searchQuery.length >= 2 ? searchResults.slice(0, 5) : []), [searchResults, searchQuery]);

  const totalDuration = useMemo(() =>
    patientEntries.reduce((sum, pe) => sum + pe.consultations.reduce((s, c) => s + c.duration, 0), 0),
  [patientEntries]);

  const requiredCategories = useMemo(() => {
    const cats = new Set<string>();
    patientEntries.forEach(pe => pe.consultations.forEach(c => cats.add(c.categoryId)));
    return cats;
  }, [patientEntries]);

  const eligibleDoctors = useMemo(() =>
    doctors.filter(d => !d.isOnVacation && [...requiredCategories].every(cat => d.categoryIds.includes(cat))),
  [doctors, requiredCategories]);

  const eligibleDoctorIds = useMemo(() => eligibleDoctors.map(d => d.id), [eligibleDoctors]);

  const { data: availableSlots } = useAvailableSlots(
    selectedDate,
    specificDoctor && selectedDoctorId ? selectedDoctorId : undefined,
    totalDuration,
    !specificDoctor || !selectedDoctorId ? eligibleDoctorIds : undefined
  );

  const selectPatient = (idx: number, patientId: string) => {
    setPatientEntries(prev => prev.map((pe, i) => i === idx ? { ...pe, patientId, isNew: false } : pe));
    setSearchQuery('');
  };

  const addConsultation = (idx: number, categoryId: string, typeId: string) => {
    const ct = allConsultationTypes.find(c => c.id === typeId);
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

    const recurringGroupId = isRecurring ? `rg-${Date.now()}` : undefined;
    const count = isRecurring ? Math.min(Math.max(parseInt(recurringCount) || 1, 1), 12) : 1;
    const freqDays = recurringFreq === 'weekly' ? 7 : recurringFreq === 'biweekly' ? 14 : 30;

    let createdCount = 0;
    for (let i = 0; i < count; i++) {
      const offsetDays = i * freqDays;
      const aptDate = new Date(selectedDate + 'T00:00:00');
      aptDate.setDate(aptDate.getDate() + offsetDays);
      if (aptDate.getDay() === 0) aptDate.setDate(aptDate.getDate() + 1);
      const dateStr = aptDate.toISOString().split('T')[0];

      const newApt: Appointment = {
        id: `apt-${Date.now()}-${i}`,
        doctorId,
        date: dateStr,
        startTime: isWalkIn ? undefined : (selectedTime || undefined),
        totalDurationMinutes: totalDuration,
        patients: aptPatients,
        status: 'programat',
        isWalkIn: isWalkIn || undefined,
        smsConfirmationSent: i === 0 ? sendSms : false,
        createdAt: new Date().toISOString(),
        timeline: [{ timestamp: new Date().toISOString(), action: i === 0 ? 'Creat' : `Creat (recurent ${i + 1}/${count})`, actor: 'Recepție' }],
        recurringGroupId,
      };

      addAppointment(newApt);
      createdCount++;
    }

    toast({ title: createdCount > 1 ? `${createdCount} programări recurente create!` : 'Programare creată cu succes!' });
    setActivePanel({ type: 'none' });
  };

  const isPrefilled = !!(pf?.doctorId && pf?.startTime);

  return (
    <div className="space-y-6">
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
            <SelectedPatientDisplay patientId={pe.patientId} onClear={() => setPatientEntries(prev => prev.map((p, i) => i === idx ? createEmptyPatientEntry() : p))} />
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
              {activeSearchIdx === idx && filteredSearchResults.length > 0 && (
                <div className="border border-border rounded-md bg-popover shadow-md overflow-hidden">
                  {filteredSearchResults.map(p => (
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

          <ConsultationSelector
            consultations={pe.consultations}
            onAdd={(catId, typeId) => addConsultation(idx, catId, typeId)}
            onRemove={(cIdx) => removeConsultation(idx, cIdx)}
          />
        </div>
      ))}

      {patientEntries.length < 5 && (
        <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary" onClick={() => setPatientEntries(prev => [...prev, createEmptyPatientEntry()])}>
          <Plus className="h-3.5 w-3.5" /> Adaugă pacient la aceeași programare
        </Button>
      )}

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

      {totalDuration > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-sm">
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-medium">Durată totală estimată:</span>
          <span className="font-bold text-primary">{formatDuration(totalDuration)}</span>
        </div>
      )}

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

function SelectedPatientDisplay({ patientId, onClear }: { patientId: string; onClear: () => void }) {
  const { data: patient } = usePatientById(patientId);
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent border border-border">
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{patient?.lastName} {patient?.firstName}</p>
        <p className="text-xs text-muted-foreground">{patient?.phone}</p>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClear}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

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
  const { data: categories } = useCategories();
  const { data: allConsultationTypes } = useConsultationTypes();

  const filteredTypes = useMemo(() =>
    allConsultationTypes.filter(ct => ct.categoryId === selCat),
  [allConsultationTypes, selCat]);

  const handleAdd = () => {
    if (selCat && selType) {
      onAdd(selCat, selType);
      setSelCat('');
      setSelType('');
    }
  };

  return (
    <div className="space-y-2">
      {consultations.map((c, i) => {
        const ct = allConsultationTypes.find(t => t.id === c.typeId);
        return (
          <div key={i} className="flex items-center gap-2 px-2 py-1 rounded bg-muted text-xs">
            <span className="flex-1 font-medium">{ct?.name || c.typeId} — {formatDuration(c.duration)}</span>
            <button onClick={() => onRemove(i)} className="text-destructive hover:text-destructive/80"><X className="h-3 w-3" /></button>
          </div>
        );
      })}

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
