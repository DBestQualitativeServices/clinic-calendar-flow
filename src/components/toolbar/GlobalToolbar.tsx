import React from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ro } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useUIState } from '@/store/uiStore';
import { useCategories, useDoctors } from '@/hooks/data';
import { cn } from '@/lib/utils';

export default function GlobalToolbar() {
  const { calendar, setCalendar, setActivePanel } = useUIState();
  const { data: categories } = useCategories();
  const { data: doctors } = useDoctors();
  const currentDate = new Date(calendar.selectedDate + 'T00:00:00');

  const navigateDay = (dir: number) => {
    const newDate = dir > 0 ? addDays(currentDate, 1) : subDays(currentDate, 1);
    setCalendar({ selectedDate: newDate.toISOString().split('T')[0] });
  };

  const isToday = calendar.selectedDate === new Date().toISOString().split('T')[0];
  const weeklyDoctor = calendar.viewMode === 'weekly' ? doctors.find(d => d.id === calendar.selectedDoctorId) : null;

  return (
    <div className="flex items-center justify-between px-5 py-2.5 bg-card border-b border-border shadow-sm">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-primary tracking-tight">PolBine</span>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 font-semibold"
          onClick={() => setActivePanel({ type: 'booking' })}
        >
          <Plus className="h-4 w-4" />
          Programare nouă
        </Button>
      </div>

      <div className="flex items-center gap-3">
        {weeklyDoctor && (
          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs font-semibold text-primary">{weeklyDoctor.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalendar({ viewMode: 'daily', selectedDoctorId: undefined })}
              className="text-xs h-7"
            >
              ← Vedere zilnică
            </Button>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCalendar({ specialtyFilter: undefined })}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              !calendar.specialtyFilter
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Toate
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCalendar({ specialtyFilter: calendar.specialtyFilter === cat.id ? undefined : cat.id })}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                calendar.specialtyFilter === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isToday ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-primary w-8"
            onClick={() => setCalendar({ selectedDate: new Date().toISOString().split('T')[0] })}
          >
            Azi
          </Button>
        ) : (
          <div className="w-8" />
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("gap-1.5 font-medium w-[220px] justify-start", isToday && "ring-2 ring-primary/30")}>
              <CalendarIcon className="h-3.5 w-3.5" />
              {format(currentDate, "EEEE, d MMMM yyyy", { locale: ro })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(d) => d && setCalendar({ selectedDate: d.toISOString().split('T')[0] })}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateDay(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateDay(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
