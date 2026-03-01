import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Appointment, TimeBlock, CalendarState } from '@/types';
import { initialAppointments, initialTimeBlocks } from '@/data/mock';

interface AppState {
  appointments: Appointment[];
  timeBlocks: TimeBlock[];
  calendar: CalendarState;
  setCalendar: (update: Partial<CalendarState>) => void;
  updateAppointment: (id: string, update: Partial<Appointment>) => void;
  addAppointment: (apt: Appointment) => void;
  addTimeBlock: (tb: TimeBlock) => void;
  removeTimeBlock: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(initialTimeBlocks);
  const [calendar, setCalendarState] = useState<CalendarState>({
    viewMode: 'daily',
    selectedDate: new Date().toISOString().split('T')[0],
  });

  const setCalendar = useCallback((update: Partial<CalendarState>) => {
    setCalendarState(prev => ({ ...prev, ...update }));
  }, []);

  const updateAppointment = useCallback((id: string, update: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...update } : a));
  }, []);

  const addAppointment = useCallback((apt: Appointment) => {
    setAppointments(prev => [...prev, apt]);
  }, []);

  const addTimeBlock = useCallback((tb: TimeBlock) => {
    setTimeBlocks(prev => [...prev, tb]);
  }, []);

  const removeTimeBlock = useCallback((id: string) => {
    setTimeBlocks(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      appointments, timeBlocks, calendar,
      setCalendar, updateAppointment, addAppointment, addTimeBlock, removeTimeBlock,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be inside AppProvider');
  return ctx;
}
