import React from 'react';
import { useUIState } from '@/store/uiStore';
import SlideInPanel from './SlideInPanel';
import BookingPanel from './BookingPanel';
import AppointmentDetailsPanel from './AppointmentDetailsPanel';
import PatientFormPanel from './PatientFormPanel';
import FormViewerPanel from './FormViewerPanel';
import PatientDetailsPanel from './PatientDetailsPanel';

export default function PanelContainer() {
  const { activePanel, setActivePanel } = useUIState();
  const close = () => setActivePanel({ type: 'none' });
  const isOpen = activePanel.type !== 'none';

  const titles: Record<string, string> = {
    booking: 'Programare nouă',
    details: 'Detalii programare',
    patientForm: 'Completare date pacient',
    formViewer: 'Vizualizare formular',
    patientDetails: 'Fișa pacientului',
  };

  return (
    <SlideInPanel open={isOpen} onClose={close} title={titles[activePanel.type] || ''}>
      {activePanel.type === 'booking' && <BookingPanel prefill={activePanel} />}
      {activePanel.type === 'details' && <AppointmentDetailsPanel appointmentId={activePanel.appointmentId} />}
      {activePanel.type === 'patientForm' && (
        <PatientFormPanel
          patientId={activePanel.patientId}
          onComplete={activePanel.onComplete}
        />
      )}
      {activePanel.type === 'formViewer' && (
        <FormViewerPanel formId={activePanel.formId} patientId={activePanel.patientId} />
      )}
      {activePanel.type === 'patientDetails' && (
        <PatientDetailsPanel patientId={activePanel.patientId} />
      )}
    </SlideInPanel>
  );
}
