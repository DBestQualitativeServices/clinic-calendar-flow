import React from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ro } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, CalendarIcon, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useUIState } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export default function GlobalToolbar() {
  const { calendar, setCalendar, setActivePanel } = useUIState();
  const currentDate = new Date(calendar.selectedDate + 'T00:00:00');

  const navigateDay = (dir: number) => {
    const newDate = dir > 0 ? addDays(currentDate, 1) : subDays(currentDate, 1);
    setCalendar({ selectedDate: newDate.toISOString().split('T')[0] });
  };

  const isToday = calendar.selectedDate === new Date().toISOString().split('T')[0];
  const weeklyDoctor = calendar.viewMode === 'weekly' ? undefined : null;

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

      <div className="flex items-center gap-2 flex-1 max-w-md mx-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Caută pacient, consultație, doctor..."
            value={calendar.searchQuery ?? ''}
            onChange={(e) => setCalendar({ searchQuery: e.target.value || undefined })}
            className="pl-8 h-8 text-xs"
          />
          {calendar.searchQuery && (
            <button
              onClick={() => setCalendar({ searchQuery: undefined })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
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
