import React from 'react';
import { useAppState } from '@/store/appStore';
import SlideInPanel from './SlideInPanel';
import BookingPanel from './BookingPanel';
import AppointmentDetailsPanel from './AppointmentDetailsPanel';

export default function PanelContainer() {
  const { activePanel, setActivePanel } = useAppState();
  const close = () => setActivePanel({ type: 'none' });
  const isOpen = activePanel.type !== 'none';

  const titles: Record<string, string> = {
    booking: 'Programare nouă',
    details: 'Detalii programare',
    patientForm: 'Completare date pacient',
  };

  return (
    <SlideInPanel open={isOpen} onClose={close} title={titles[activePanel.type] || ''}>
      {activePanel.type === 'booking' && <BookingPanel prefill={activePanel} />}
      {activePanel.type === 'details' && <AppointmentDetailsPanel appointmentId={activePanel.appointmentId} />}
      {activePanel.type === 'patientForm' && (
        <div className="text-sm text-muted-foreground p-4">
          Formular pacient complet — în curs de implementare.
        </div>
      )}
    </SlideInPanel>
  );
}
