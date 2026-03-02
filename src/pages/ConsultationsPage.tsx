import React, { useMemo, useState } from 'react';
import { format, startOfWeek, addDays, subWeeks, addWeeks } from 'date-fns';
import { ro } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Lock, CalendarPlus, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDoctors, useAppointments, useBlockedSlots, useConsultationTypes, usePatientById, useCreateBlockedSlot, usePatients } from '@/hooks/data';
import { useUIState } from '@/store/uiStore';
import { generateTimeSlots, timeToMinutes, minutesToTime, formatDuration, formatPatientName } from '@/lib/calendar-utils';
import { STATUS_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const SLOT_HEIGHT = 48;

function DayAppointmentCard({ appointment, highlighted, dimmed }: { appointment: import('@/types').Appointment; highlighted?: boolean; dimmed?: boolean }) {
  const { setActivePanel } = useUIState();
  const { data: consultationTypes } = useConsultationTypes();
  const { data: patient } = usePatientById(appointment.patients[0]?.patientId);
  const badge = STATUS_CONFIG[appointment.status];
  const heightPx = Math.max((appointment.totalDurationMinutes / 30) * SLOT_HEIGHT, SLOT_HEIGHT * 0.6);
  const startMin = timeToMinutes(appointment.startTime!) - 480;
  const topPx = (startMin / 30) * SLOT_HEIGHT;
  const name = patient ? formatPatientName(patient) : 'Necunoscut';

  return (
    <div
      className={cn(
        "absolute left-1 right-1 rounded-md px-2 py-1 cursor-pointer overflow-hidden border border-border bg-card",
        "border-l-[3px] transition-all duration-200",
        appointment.status === 'finalizat' && 'opacity-60',
        appointment.status === 'anulat' && 'opacity-40',
        highlighted && 'ring-2 ring-primary shadow-md scale-[1.02] z-20',
        dimmed && 'opacity-30',
      )}
      style={{
        top: `${topPx}px`,
        height: `${heightPx}px`,
        borderLeftColor: `hsl(var(--status-${appointment.status.replace('_', '-')}))`,
      }}
      onClick={() => setActivePanel({ type: 'details', appointmentId: appointment.id })}
    >
      <p className="text-[10px] font-semibold truncate text-foreground">{name}</p>
      {heightPx > 30 && (
        <p className="text-[9px] text-muted-foreground truncate">
          {appointment.patients[0]?.consultations.map(c => {
            const ct = consultationTypes.find(t => t.id === c.consultationTypeId);
            return ct?.name ?? '';
          }).join(', ')}
        </p>
      )}
      {heightPx > 44 && (
        <span className={cn('text-[8px] px-1 py-0.5 rounded-full mt-0.5 inline-block', badge.cls)}>
          {badge.label}
        </span>
      )}
    </div>
  );
}

function EmptySlotBlock({ doctorId, date, startTime }: { doctorId: string; date: string; startTime: string }) {
  const { mutate: addBlock } = useCreateBlockedSlot();
  const { setActivePanel } = useUIState();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'choose' | 'pause'>('choose');
  const [duration, setDuration] = useState('30');
  const [reason, setReason] = useState('');

  const handleBlock = () => {
    let dur = parseInt(duration);
    if (duration === 'rest') dur = 1080 - timeToMinutes(startTime);
    addBlock({
      id: `tb-${Date.now()}`,
      doctorId,
      date,
      startTime,
      durationMinutes: dur,
      reason: reason || 'Pauză',
    });
    toast({ title: 'Pauză adăugată', description: `${startTime} — ${minutesToTime(timeToMinutes(startTime) + dur)}` });
    resetAndClose();
  };

  const handleBooking = () => {
    setOpen(false);
    setMode('choose');
    setActivePanel({ type: 'booking', prefill: { doctorId, date, startTime } });
  };

  const resetAndClose = () => {
    setOpen(false);
    setMode('choose');
    setDuration('30');
    setReason('');
  };

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setMode('choose'); } }}>
      <PopoverTrigger asChild>
        <div
          className="border-b border-border hover:bg-accent/30 transition-colors cursor-pointer relative"
          style={{ height: `${SLOT_HEIGHT}px` }}
        >
          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-border/50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2" align="start" side="right">
        {mode === 'choose' ? (
          <div className="flex flex-col gap-1.5 p-1">
            <p className="text-[10px] text-muted-foreground font-medium mb-0.5">{startTime} — {date}</p>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 justify-start" onClick={handleBooking}>
              <CalendarPlus className="h-3.5 w-3.5" /> Programare nouă
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 justify-start" onClick={() => setMode('pause')}>
              <Lock className="h-3.5 w-3.5" /> Adaugă pauză
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-1">
            <p className="text-xs font-semibold flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Pauză de la {startTime}
            </p>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">1 oră</SelectItem>
                <SelectItem value="rest">Restul zilei</SelectItem>
              </SelectContent>
            </Select>
            <Input className="h-7 text-xs" placeholder="Motiv..." value={reason} onChange={e => setReason(e.target.value)} />
            <div className="flex gap-1.5">
              <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleBlock}>Confirmă</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={resetAndClose}>Anulează</Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

/* Checked-in patients zone — shows patients with status 'sosit' */
function CheckedInCard({ apt }: { apt: import('@/types').Appointment }) {
  const { data: consultationTypes } = useConsultationTypes();
  const { data: patient } = usePatientById(apt.patients[0]?.patientId);
  const { setActivePanel } = useUIState();
  const name = patient ? formatPatientName(patient) : 'Necunoscut';
  const badge = STATUS_CONFIG[apt.status];

  return (
    <div
      className={cn(
        "flex-shrink-0 rounded-md px-3 py-2 text-xs cursor-pointer border shadow-sm hover:shadow-md transition-shadow",
        "bg-status-sosit/15 border-status-sosit/40"
      )}
      onClick={() => setActivePanel({ type: 'details', appointmentId: apt.id })}
    >
      <p className="font-semibold text-foreground">{name}</p>
      <p className="text-[10px] text-muted-foreground">
        {apt.startTime || 'Walk-in'} · {formatDuration(apt.totalDurationMinutes)}
      </p>
      <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">
        {apt.patients[0]?.consultations.map(c => {
          const ct = consultationTypes.find(t => t.id === c.consultationTypeId);
          return ct?.name ?? '';
        }).join(', ')}
      </p>
      <span className={cn('text-[8px] px-1.5 py-0.5 rounded-full mt-1 inline-block', badge.cls)}>
        {badge.label}
      </span>
    </div>
  );
}

function CheckedInZone({ checkedIn }: { checkedIn: import('@/types').Appointment[] }) {
  const [expanded, setExpanded] = useState(checkedIn.length > 0);

  if (checkedIn.length === 0 && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 px-5 py-1.5 bg-card border-b border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown className="h-3 w-3" />
        Niciun pacient la recepție
      </button>
    );
  }

  return (
    <div className="bg-card border-b border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-5 py-1.5 text-xs font-medium text-foreground hover:text-primary transition-colors w-full text-left"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        <Clock className="h-3 w-3" />
        Pacienți sosiți ({checkedIn.length})
      </button>

      {expanded && (
        <div className="flex gap-2 px-5 pb-2.5 overflow-x-auto">
          {checkedIn.length === 0 ? (
            <p className="text-xs text-muted-foreground py-1">Niciun pacient sosit momentan.</p>
          ) : (
            checkedIn.map(apt => <CheckedInCard key={apt.id} apt={apt} />)
          )}
        </div>
      )}
    </div>
  );
}

export default function ConsultationsPage() {
  const { data: doctors } = useDoctors();
  const { data: patients } = usePatients();
  const { data: consultationTypes } = useConsultationTypes();
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id ?? '');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const { searchQuery: rawSearch } = useUIState();
  const searchQuery = rawSearch.toLowerCase().trim();

  // Generate 6 days (Mon-Sat)
  const weekDays = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = addDays(weekStart, i);
      return { date: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE d', { locale: ro }), dayObj: d };
    });
  }, [weekStart]);

  // Collect all appointments for this doctor across the week for search
  const allWeekDates = useMemo(() => weekDays.map(d => d.date), [weekDays]);

  // Checked-in patients: all 'sosit' appointments for this doctor today
  const today = new Date().toISOString().split('T')[0];
  const { data: todayAppointments } = useAppointments(today, selectedDoctorId);
  const checkedIn = useMemo(
    () => todayAppointments
      .filter(a => a.status === 'sosit')
      .sort((a, b) => {
        const aMin = a.startTime ? timeToMinutes(a.startTime) : 9999;
        const bMin = b.startTime ? timeToMinutes(b.startTime) : 9999;
        return aMin - bMin;
      }),
    [todayAppointments]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-card/50">
        <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
          <SelectTrigger className="w-[240px] h-9 text-sm font-medium">
            <SelectValue placeholder="Selectează doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.filter(d => !d.isOnVacation).map(d => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekStart(prev => subWeeks(prev, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[180px] text-center">
            {format(weekStart, 'd MMM', { locale: ro })} — {format(addDays(weekStart, 5), 'd MMM yyyy', { locale: ro })}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekStart(prev => addWeeks(prev, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs ml-2"
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
          >
            Săpt. curentă
          </Button>
        </div>
      </div>

      {/* Checked-in patients zone */}
      {selectedDoctor && <CheckedInZone checkedIn={checkedIn} />}

      {/* Grid */}
      {selectedDoctor && (
        <div className="flex-1 overflow-auto">
          <div className="flex min-w-fit">
            {/* Time column */}
            <div className="sticky left-0 z-10 bg-background border-r border-border w-14 flex-shrink-0">
              {timeSlots.map(slot => (
                <div key={slot} className="border-b border-border flex items-start justify-end pr-2 pt-1" style={{ height: `${SLOT_HEIGHT}px` }}>
                  <span className="text-[10px] text-muted-foreground font-medium">{slot}</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map(day => (
              <DayColumn
                key={day.date}
                date={day.date}
                label={day.label}
                doctorId={selectedDoctorId}
                timeSlots={timeSlots}
                searchQuery={searchQuery}
                patients={patients}
                consultationTypes={consultationTypes}
              />
            ))}
          </div>
        </div>
      )}

      {!selectedDoctor && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Selectează un doctor pentru a vedea programul săptămânal.
        </div>
      )}
    </div>
  );
}

function DayColumn({ date, label, doctorId, timeSlots, searchQuery, patients, consultationTypes }: {
  date: string; label: string; doctorId: string; timeSlots: string[];
  searchQuery: string;
  patients: import('@/types').Patient[];
  consultationTypes: import('@/types').ConsultationType[];
}) {
  const { data: appointments } = useAppointments(date, doctorId);
  const { data: timeBlocks } = useBlockedSlots(date);
  const { data: doctors } = useDoctors();
  const isToday = date === new Date().toISOString().split('T')[0];

  const doctorBlocks = useMemo(
    () => timeBlocks.filter(tb => tb.doctorId === doctorId),
    [timeBlocks, doctorId]
  );

  const activeApts = useMemo(
    () => appointments.filter(a => a.startTime && a.status !== 'anulat'),
    [appointments]
  );

  // Search: compute matching IDs like /scheduling
  const matchingIds = useMemo(() => {
    if (!searchQuery) return new Set<string>();
    const ids = new Set<string>();
    for (const apt of activeApts) {
      const doctor = doctors.find(d => d.id === apt.doctorId);
      if (doctor?.name.toLowerCase().includes(searchQuery)) { ids.add(apt.id); continue; }
      const patientMatch = apt.patients.some(pe => {
        const p = patients.find(pt => pt.id === pe.patientId);
        if (!p) return false;
        return `${p.lastName} ${p.firstName}`.toLowerCase().includes(searchQuery) ||
               `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery);
      });
      if (patientMatch) { ids.add(apt.id); continue; }
      const consultMatch = apt.patients.some(pe =>
        pe.consultations.some(c => {
          const ct = consultationTypes.find(t => t.id === c.consultationTypeId);
          return ct?.name.toLowerCase().includes(searchQuery);
        })
      );
      if (consultMatch) ids.add(apt.id);
    }
    return ids;
  }, [searchQuery, activeApts, doctors, patients, consultationTypes]);

  const hasSearch = !!searchQuery;

  return (
    <div className="flex flex-col min-w-[140px] flex-1">
      {/* Day header */}
      <div className={cn(
        "sticky top-0 z-10 border-b border-r border-border p-2 text-center bg-card",
        isToday && "bg-primary/10"
      )}>
        <p className={cn("text-xs font-semibold capitalize", isToday && "text-primary")}>{label}</p>
        <p className="text-[10px] text-muted-foreground">{activeApts.length} prog.</p>
      </div>

      {/* Slots */}
      <div className="relative border-r border-border">
        {timeSlots.map(slot => (
          <EmptySlotBlock key={slot} doctorId={doctorId} date={date} startTime={slot} />
        ))}

        {/* Blocked slots */}
        {doctorBlocks.map(tb => {
          const startMin = timeToMinutes(tb.startTime) - 480;
          const topPx = (startMin / 30) * SLOT_HEIGHT;
          const heightPx = (tb.durationMinutes / 30) * SLOT_HEIGHT;
          return (
            <div
              key={tb.id}
              className="absolute left-0 right-0 pattern-hatch border border-status-blocked/30 rounded-sm flex items-center justify-center pointer-events-none"
              style={{ top: `${topPx}px`, height: `${heightPx}px` }}
            >
              {tb.reason && (
                <span className="text-[9px] text-muted-foreground font-medium bg-card/70 px-1 rounded">
                  {tb.reason}
                </span>
              )}
            </div>
          );
        })}

        {/* Appointments */}
        {activeApts.map(apt => (
          <DayAppointmentCard
            key={apt.id}
            appointment={apt}
            highlighted={hasSearch && matchingIds.has(apt.id)}
            dimmed={hasSearch && !matchingIds.has(apt.id)}
          />
        ))}
      </div>
    </div>
  );
}
