import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { format, addDays, subDays } from 'date-fns';
import { ro } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, CalendarIcon, Search, X, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useUIState } from '@/store/uiStore';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const SEARCH_PLACEHOLDERS: Record<string, string> = {
  '/scheduling': 'Caută pacient, consultație, doctor...',
  '/patients': 'Caută pacient (nume, telefon, CNP)...',
  '/forms': 'Caută pacient sau formular...',
  '/consultations': 'Caută pacient sau consultație...',
};

export default function GlobalToolbar() {
  const { calendar, setCalendar, setActivePanel, searchQuery, setSearchQuery } = useUIState();
  const { toggleSidebar } = useSidebar();
  const location = useLocation();
  const currentDate = new Date(calendar.selectedDate + 'T00:00:00');
  const isScheduling = location.pathname === '/scheduling';

  useEffect(() => { setSearchQuery(''); }, [location.pathname, setSearchQuery]);

  const navigateDay = (dir: number) => {
    const newDate = dir > 0 ? addDays(currentDate, 1) : subDays(currentDate, 1);
    setCalendar({ selectedDate: newDate.toISOString().split('T')[0] });
  };

  const isToday = calendar.selectedDate === new Date().toISOString().split('T')[0];
  const placeholder = SEARCH_PLACEHOLDERS[location.pathname] || 'Caută...';

  return (
    <div className="flex items-center justify-between px-5 py-2.5 bg-card border-b border-border shadow-sm">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSidebar}>
          <PanelLeft className="h-4 w-4" />
        </Button>
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
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isScheduling && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
