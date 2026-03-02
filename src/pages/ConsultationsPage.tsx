import React, { useMemo, useState } from 'react';
import { format, startOfWeek, addDays, subWeeks, addWeeks } from 'date-fns';
import { ro } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDoctors, useAppointments, useBlockedSlots, useConsultationTypes, usePatientById, useCreateBlockedSlot } from '@/hooks/data';
import { useUIState } from '@/store/uiStore';
import { generateTimeSlots, timeToMinutes, minutesToTime, formatDuration, formatPatientName } from '@/lib/calendar-utils';
import { STATUS_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const SLOT_HEIGHT = 48;

function DayAppointmentCard({ appointment }: { appointment: import('@/types').Appointment }) {
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
        "border-l-[3px]",
        appointment.status === 'finalizat' && 'opacity-60',
        appointment.status === 'anulat' && 'opacity-40',
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
  const [open, setOpen] = useState(false);
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
    setOpen(false);
    setDuration('30');
    setReason('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="border-b border-border hover:bg-accent/30 transition-colors cursor-pointer relative"
          style={{ height: `${SLOT_HEIGHT}px` }}
        >
          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-border/50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2" align="start" side="right">
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
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOpen(false)}>Anulează</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function ConsultationsPage() {
  const { data: doctors } = useDoctors();
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id ?? '');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Generate 6 days (Mon-Sat)
  const weekDays = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = addDays(weekStart, i);
      return { date: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE d', { locale: ro }), dayObj: d };
    });
  }, [weekStart]);

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

        <div className="flex items-center gap-1 ml-auto">
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

function DayColumn({ date, label, doctorId, timeSlots }: { date: string; label: string; doctorId: string; timeSlots: string[] }) {
  const { data: appointments } = useAppointments(date, doctorId);
  const { data: timeBlocks } = useBlockedSlots(date);
  const isToday = date === new Date().toISOString().split('T')[0];

  const doctorBlocks = useMemo(
    () => timeBlocks.filter(tb => tb.doctorId === doctorId),
    [timeBlocks, doctorId]
  );

  const activeApts = useMemo(
    () => appointments.filter(a => a.startTime && a.status !== 'anulat'),
    [appointments]
  );

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
          <DayAppointmentCard key={apt.id} appointment={apt} />
        ))}
      </div>
    </div>
  );
}
