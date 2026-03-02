import React from 'react';
import { useCompletedForms, useFormTemplates, usePatientById } from '@/hooks/data';
import { cn } from '@/lib/utils';
import { CheckSquare, Square, Type, FileText } from 'lucide-react';

export default function FormViewerPanel({ formId, patientId }: { formId: string; patientId: string }) {
  const { data: forms } = useCompletedForms(patientId);
  const { data: templates } = useFormTemplates();
  const { data: patient } = usePatientById(patientId);

  const form = forms.find(f => f.id === formId);
  const template = form ? templates.find(t => t.id === form.formTemplateId) : null;

  if (!form || !template) {
    return <p className="text-sm text-muted-foreground">Formularul nu a fost găsit.</p>;
  }

  const now = new Date().toISOString();
  const isValid = form.expiresAt > now;

  return (
    <div className="space-y-5">
      {/* Status + patient */}
      <div className="flex items-center justify-between">
        <span className={cn(
          'text-xs px-3 py-1 rounded-full font-semibold',
          isValid ? 'bg-emerald-500/20 text-emerald-700' : 'bg-muted text-muted-foreground',
        )}>
          {isValid ? 'Valid' : 'Expirat'}
        </span>
        <span className="text-xs text-muted-foreground">
          {form.signatures.length}/{template.signatureCount} semnături
        </span>
      </div>

      {/* Patient info */}
      {patient && (
        <div className="p-3 rounded-md bg-accent/50 border border-border">
          <p className="text-sm font-bold">{patient.lastName} {patient.firstName}</p>
          <p className="text-xs text-muted-foreground">{patient.phone} · CNP: {patient.cnp || '—'}</p>
        </div>
      )}

      {/* Dates */}
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Detalii</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Completat</span>
            <span className="font-medium">{new Date(form.completedAt).toLocaleString('ro-RO')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expiră</span>
            <span className="font-medium">{new Date(form.expiresAt).toLocaleString('ro-RO')}</span>
          </div>
        </div>
      </div>

      {/* Questions & Answers */}
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Întrebări și răspunsuri</p>
        <div className="space-y-3">
          {template.questions.map(q => {
            const answer = form.answers.find(a => a.questionId === q.id);
            return (
              <div key={q.id} className="p-3 rounded-md bg-muted/30 border border-border space-y-2">
                <div className="flex items-start gap-2">
                  {q.type === 'checkbox' ? (
                    <CheckSquare className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  ) : (
                    <Type className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  )}
                  <span className="text-xs font-medium">
                    {q.text}
                    {q.required && <span className="text-destructive ml-0.5">*</span>}
                  </span>
                </div>
                <div className="ml-6">
                  {q.type === 'checkbox' ? (
                    <div className="flex items-center gap-1.5">
                      {answer?.value ? (
                        <CheckSquare className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">{answer?.value ? 'Da' : 'Nu'}</span>
                    </div>
                  ) : (
                    <p className="text-xs bg-card rounded px-2 py-1.5 border border-border">
                      {answer?.value ? String(answer.value) : <span className="italic text-muted-foreground">Necompletat</span>}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Signatures */}
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Semnături</p>
        <div className="space-y-2">
          {form.signatures.map((_, i) => (
            <div key={i} className="border border-border rounded-md p-3 bg-muted/20 flex items-center justify-center h-20">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Semnătura {i + 1} ✓</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
