import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { useTabletSessionByCode } from '@/hooks/mock';
import { FileText } from 'lucide-react';

export default function TabletLogin() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { data: sessionData } = useTabletSessionByCode(code);

  const handleAccess = () => {
    if (sessionData) {
      setError('');
      navigate(`/tablet/forms?code=${code}`);
    } else {
      setError('Cod invalid. Verificați la recepție.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-slate-50">
      <div className="w-full max-w-sm text-center space-y-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-slate-800">PolBine</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Completare formulare medicale</h1>
          <p className="text-base text-slate-500">Introduceți codul primit de la recepție</p>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={4}
            value={code}
            onChange={(val) => { setCode(val); setError(''); }}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3].map(i => (
                <InputOTPSlot key={i} index={i} className="h-16 w-14 text-2xl font-bold border-2" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && <p className="text-destructive text-base font-medium">{error}</p>}

        <Button
          onClick={handleAccess}
          disabled={code.length < 4}
          className="w-full h-14 text-lg rounded-xl"
        >
          Accesează
        </Button>

        <p className="text-sm text-slate-400">Ecranul se va reseta după 10 minute de inactivitate</p>
      </div>
    </div>
  );
}
