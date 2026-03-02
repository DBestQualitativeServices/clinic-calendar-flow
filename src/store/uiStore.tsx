import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { CalendarState } from '@/types';

// Panel types for shared slide-in container
export type PanelType =
  | { type: 'none' }
  | { type: 'booking'; prefill?: { doctorId?: string; date?: string; startTime?: string; appointment?: import('@/types').Appointment } }
  | { type: 'details'; appointmentId: string }
  | { type: 'patientForm'; patientId?: string; onComplete?: () => void }
  | { type: 'formViewer'; formId: string; patientId: string }
  | { type: 'patientDetails'; patientId: string };

interface UIState {
  calendar: CalendarState;
  activePanel: PanelType;
  secondaryPanel: PanelType;
  setCalendar: (update: Partial<CalendarState>) => void;
  setActivePanel: (panel: PanelType) => void;
  setSecondaryPanel: (panel: PanelType) => void;
}

const UIContext = createContext<UIState | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [calendar, setCalendarState] = useState<CalendarState>({
    viewMode: 'daily',
    selectedDate: new Date().toISOString().split('T')[0],
  });
  const [activePanel, setActivePanelState] = useState<PanelType>({ type: 'none' });
  const [secondaryPanel, setSecondaryPanelState] = useState<PanelType>({ type: 'none' });

  const setCalendar = useCallback((update: Partial<CalendarState>) => {
    setCalendarState(prev => ({ ...prev, ...update }));
  }, []);

  const setActivePanel = useCallback((panel: PanelType) => {
    setActivePanelState(panel);
    // Close secondary when primary changes
    if (panel.type === 'none') {
      setSecondaryPanelState({ type: 'none' });
    }
  }, []);

  const setSecondaryPanel = useCallback((panel: PanelType) => {
    setSecondaryPanelState(panel);
  }, []);

  return (
    <UIContext.Provider value={{ calendar, activePanel, secondaryPanel, setCalendar, setActivePanel, setSecondaryPanel }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUIState() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUIState must be inside UIProvider');
  return ctx;
}
