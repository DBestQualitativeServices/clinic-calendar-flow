import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppState } from '@/store/appStore';
import { formTemplates } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Send } from 'lucide-react';
import SignatureCanvas from '@/components/tablet/SignatureCanvas';
import type { CompletedForm } from '@/types';
import { cn } from '@/lib/utils';

export default function TabletFormView() {
  const { templateId } = useParams<{ templateId: string }>();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || '';
  const navigate = useNavigate();
  const { tabletSessions, addCompletedForm } = useAppState();

  const session = tabletSessions.find(s => s.accessCode === code && s.active);
  const template = formTemplates.find(t => t.id === templateId);

  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [signatures, setSignatures] = useState<(string | null)[]>(
    new Array(template?.signatureCount || 1).fill(null)
  );

  if (!session || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-slate-700 mb-4">Formular invalid</p>
          <Button onClick={() => navigate('/tablet')} className="h-14 text-lg rounded-xl">Înapoi</Button>
        </div>
      </div>
    );
  }

  const setAnswer = (qId: string, value: unknown) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  // Validate
  const isValid = useMemo(() => {
    const allRequiredAnswered = template.questions
      .filter(q => q.required)
      .every(q => {
        const val = answers[q.id];
        if (q.type === 'checkbox') return val === true;
        if (q.type === 'text') return typeof val === 'string' && val.trim().length > 0;
        if (q.type === 'single_select') return typeof val === 'string' && val.length > 0;
        return !!val;
      });
    const allSigned = signatures.every(s => s !== null);
    return allRequiredAnswered && allSigned;
  }, [answers, signatures, template]);

  const handleSubmit = () => {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + template.validityDays);

    const form: CompletedForm = {
      id: `cf-${Date.now()}`,
      patientId: session.patientId,
      formTemplateId: template.id,
      completedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })),
      signatures: signatures.filter(Boolean) as string[],
      appointmentId: session.appointmentId,
    };

    addCompletedForm(form);
    toast({ title: 'Formular trimis cu succes!' });
    navigate(`/tablet/forms?code=${code}`);
  };

  const signatureLabels = template.signatureCount === 2
    ? ['Semnătura pacient', 'Semnătura reprezentant legal']
    : ['Semnătura pacient'];

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      {/* Fixed header */}
      <div className="sticky top-0 z-10 bg-slate-50 border-b border-border px-6 py-4 flex items-center gap-3">
        <Button
          variant="ghost"
          className="h-12 text-base gap-2 rounded-xl"
          onClick={() => navigate(`/tablet/forms?code=${code}`)}
        >
          <ArrowLeft className="h-5 w-5" /> Înapoi la listă
        </Button>
        <h1 className="text-lg font-bold text-slate-800 truncate">{template.title}</h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto px-6 py-6 space-y-8">
        {template.questions.map(q => (
          <div key={q.id} className="space-y-3">
            <label className="text-base font-medium text-slate-800">
              {q.text} {q.required && <span className="text-destructive">*</span>}
            </label>

            {q.type === 'checkbox' && (
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={!!answers[q.id]}
                  onCheckedChange={(v) => setAnswer(q.id, !!v)}
                  className="h-7 w-7 rounded-md"
                />
                <span className="text-base text-slate-600">Da, confirm</span>
              </div>
            )}

            {q.type === 'text' && (
              <Textarea
                value={(answers[q.id] as string) || ''}
                onChange={e => setAnswer(q.id, e.target.value)}
                className="min-h-[100px] text-base p-4 rounded-xl"
                placeholder="Introduceți răspunsul..."
              />
            )}

            {q.type === 'single_select' && q.options && (
              <div className="flex flex-wrap gap-3">
                {q.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setAnswer(q.id, opt)}
                    className={cn(
                      'px-5 py-3 rounded-xl text-base font-medium border-2 transition-colors',
                      answers[q.id] === opt
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-white text-slate-700 hover:border-slate-300',
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Signatures */}
        {signatureLabels.map((label, idx) => (
          <SignatureCanvas
            key={idx}
            label={label}
            onSignatureChange={(dataUrl) => {
              setSignatures(prev => {
                const next = [...prev];
                next[idx] = dataUrl;
                return next;
              });
            }}
          />
        ))}
      </div>

      {/* Submit button */}
      <div className="sticky bottom-0 bg-slate-50 border-t border-border px-6 py-4">
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full h-14 text-lg rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <Send className="h-5 w-5" /> Confirm și trimit
        </Button>
      </div>
    </div>
  );
}
