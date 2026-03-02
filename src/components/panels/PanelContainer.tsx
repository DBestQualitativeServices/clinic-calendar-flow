import React from 'react';
import { useUIState } from '@/store/uiStore';
import SlideInPanel from './SlideInPanel';
import BookingPanel from './BookingPanel';
import AppointmentDetailsPanel from './AppointmentDetailsPanel';
import PatientFormPanel from './PatientFormPanel';
import FormViewerPanel from './FormViewerPanel';
import PatientDetailsPanel from './PatientDetailsPanel';

function renderPanel(panel: ReturnType<typeof useUIState>['activePanel'], setActivePanel: ReturnType<typeof useUIState>['setActivePanel']) {
  switch (panel.type) {
    case 'booking': return <BookingPanel prefill={panel} />;
    case 'details': return <AppointmentDetailsPanel appointmentId={panel.appointmentId} />;
    case 'patientForm': return <PatientFormPanel patientId={panel.patientId} onComplete={panel.onComplete} />;
    case 'formViewer': return <FormViewerPanel formId={panel.formId} patientId={panel.patientId} />;
    case 'patientDetails': return <PatientDetailsPanel patientId={panel.patientId} />;
    default: return null;
  }
}

const titles: Record<string, string> = {
  booking: 'Programare nouă',
  details: 'Detalii programare',
  patientForm: 'Editare pacient',
  formViewer: 'Vizualizare formular',
  patientDetails: 'Fișa pacientului',
};

export default function PanelContainer() {
  const { activePanel, secondaryPanel, setActivePanel, setSecondaryPanel } = useUIState();

  const closePrimary = () => setActivePanel({ type: 'none' });
  const closeSecondary = () => setSecondaryPanel({ type: 'none' });

  const primaryOpen = activePanel.type !== 'none';
  const secondaryOpen = secondaryPanel.type !== 'none';

  return (
    <>
      {/* Primary panel — shifts left when secondary is open */}
      <SlideInPanel
        open={primaryOpen}
        onClose={closePrimary}
        title={titles[activePanel.type] || ''}
        pushed={secondaryOpen}
        zIndex={40}
      >
        {renderPanel(activePanel, setActivePanel)}
      </SlideInPanel>

      {/* Secondary panel — always on the right edge */}
      <SlideInPanel
        open={secondaryOpen}
        onClose={closeSecondary}
        title={titles[secondaryPanel.type] || ''}
        zIndex={45}
      >
        {renderPanel(secondaryPanel, setSecondaryPanel)}
      </SlideInPanel>
    </>
  );
}
