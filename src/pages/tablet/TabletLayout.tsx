import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export default function TabletLayout() {
  const [expired, setExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setExpired(true), INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    resetTimer();
    const events = ['mousemove', 'touchstart', 'keydown', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, []);

  const handleExpiredOk = () => {
    setExpired(false);
    navigate('/tablet');
  };

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontSize: '18px' }}>
      <Outlet />
      {expired && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <h2 className="text-2xl font-bold mb-3 text-slate-800">Sesiune expirată</h2>
            <p className="text-base text-slate-600 mb-6">Vă rugăm să introduceți din nou codul.</p>
            <Button onClick={handleExpiredOk} className="h-14 px-10 text-lg rounded-xl">
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
