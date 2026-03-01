import React, { useState } from 'react';
import type { Appointment } from '@/types';
import { getPatientName, getConsultationsSummary, formatDuration } from '@/lib/calendar-utils';
import { doctors } from '@/data/mock';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalkInZoneProps {
  walkIns: Appointment[];
}

export default function WalkInZone({ walkIns }: WalkInZoneProps) {
  const [expanded, setExpanded] = useState(walkIns.length > 0);

  if (walkIns.length === 0 && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 px-5 py-1.5 bg-card border-b border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown className="h-3 w-3" />
        Fără programări walk-in
      </button>
    );
  }

  return (
    <div className="bg-card border-b border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-5 py-1.5 text-xs font-medium text-foreground hover:text-primary transition-colors w-full text-left"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        Fără oră fixă ({walkIns.length})
      </button>

      {expanded && (
        <div className="flex gap-2 px-5 pb-2.5 overflow-x-auto">
          {walkIns.length === 0 ? (
            <p className="text-xs text-muted-foreground py-1">Niciun pacient walk-in.</p>
          ) : (
            walkIns.map(apt => {
              const doctor = doctors.find(d => d.id === apt.doctorId);
              return (
                <div
                  key={apt.id}
                  className={cn(
                    "flex-shrink-0 rounded-md px-3 py-1.5 bg-status-programat text-white text-xs cursor-grab",
                    "border border-white/20 shadow-sm hover:shadow-md transition-shadow"
                  )}
                >
                  <p className="font-semibold">{getPatientName(apt.patients[0]?.patientId)}</p>
                  <p className="opacity-80 text-[10px]">{doctor?.name} · {formatDuration(apt.totalDurationMinutes)}</p>
                  <p className="opacity-70 text-[10px] truncate max-w-[160px]">{getConsultationsSummary(apt)}</p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
