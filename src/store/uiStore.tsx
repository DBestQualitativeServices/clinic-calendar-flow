import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { CalendarState } from '@/types';

// Panel types for shared slide-in container
export type PanelType =
  | { type: 'none' }
  | { type: 'booking'; prefill?: { doctorId?: string; date?: string; startTime?: string; appointment?: import('@/types').Appointment } }
  | { type: 'details'; appointmentId: string }
  | { type: 'patientForm'; patientId?: string; onComplete?: () => void };

interface UIState {
  calendar: CalendarState;
  activePanel: PanelType;
  setCalendar: (update: Partial<CalendarState>) => void;
  setActivePanel: (panel: PanelType) => void;
}

const UIContext = createContext<UIState | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [calendar, setCalendarState] = useState<CalendarState>({
    viewMode: 'daily',
    selectedDate: new Date().toISOString().split('T')[0],
  });
  const [activePanel, setActivePanel] = useState<PanelType>({ type: 'none' });

  const setCalendar = useCallback((update: Partial<CalendarState>) => {
    setCalendarState(prev => ({ ...prev, ...update }));
  }, []);

  return (
    <UIContext.Provider value={{ calendar, activePanel, setCalendar, setActivePanel }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUIState() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUIState must be inside UIProvider');
  return ctx;
}
