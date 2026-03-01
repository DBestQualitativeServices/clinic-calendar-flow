import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Appointment, TimeBlock, CalendarState } from '@/types';
import { initialAppointments, initialTimeBlocks } from '@/data/mock';

// Panel types for shared slide-in container
export type PanelType = 
  | { type: 'none' }
  | { type: 'booking'; prefill?: { doctorId?: string; date?: string; startTime?: string; appointment?: Appointment } }
  | { type: 'details'; appointmentId: string }
  | { type: 'patientForm'; patientId?: string; onComplete?: () => void };

interface AppState {
  appointments: Appointment[];
  timeBlocks: TimeBlock[];
  calendar: CalendarState;
  activePanel: PanelType;
  setCalendar: (update: Partial<CalendarState>) => void;
  updateAppointment: (id: string, update: Partial<Appointment>) => void;
  addAppointment: (apt: Appointment) => void;
  addTimeBlock: (tb: TimeBlock) => void;
  removeTimeBlock: (id: string) => void;
  setActivePanel: (panel: PanelType) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(initialTimeBlocks);
  const [calendar, setCalendarState] = useState<CalendarState>({
    viewMode: 'daily',
    selectedDate: new Date().toISOString().split('T')[0],
  });
  const [activePanel, setActivePanel] = useState<PanelType>({ type: 'none' });

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

  // Auto-transition: Sosit → In consult when current time >= startTime
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const today = now.toISOString().split('T')[0];
      
      setAppointments(prev => prev.map(apt => {
        if (apt.status === 'sosit' && apt.date === today && apt.startTime) {
          const [h, m] = apt.startTime.split(':').map(Number);
          const aptMinutes = h * 60 + m;
          if (nowMinutes >= aptMinutes) {
            return {
              ...apt,
              status: 'in_consult' as const,
              timeline: [...apt.timeline, { timestamp: now.toISOString(), action: 'In consult (auto)' }],
            };
          }
        }
        return apt;
      }));
    }, 60_000); // every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider value={{
      appointments, timeBlocks, calendar, activePanel,
      setCalendar, updateAppointment, addAppointment, addTimeBlock, removeTimeBlock, setActivePanel,
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
