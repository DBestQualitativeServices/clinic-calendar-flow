import React, { useState } from 'react';
import { Plus, Lock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useUIState } from '@/store/uiStore';
import { useCreateBlockedSlot } from '@/hooks/mock';
import { minutesToTime, timeToMinutes } from '@/lib/calendar-utils';
import { toast } from '@/hooks/use-toast';

interface EmptySlotPopoverProps {
  doctorId: string;
  date: string;
  startTime: string;
  children: React.ReactNode;
}

export default function EmptySlotPopover({ doctorId, date, startTime, children }: EmptySlotPopoverProps) {
  const { setActivePanel } = useUIState();
  const { mutate: addTimeBlock } = useCreateBlockedSlot();
  const [open, setOpen] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [blockDuration, setBlockDuration] = useState('30');
  const [blockReason, setBlockReason] = useState('');

  const handleNewAppointment = () => {
    setOpen(false);
    setActivePanel({ type: 'booking', prefill: { doctorId, date, startTime } });
  };

  const handleBlock = () => {
    let durationMin = parseInt(blockDuration);
    if (blockDuration === 'rest') {
      durationMin = 1080 - timeToMinutes(startTime);
    }
    addTimeBlock({
      id: `tb-${Date.now()}`,
      doctorId,
      date,
      startTime,
      durationMinutes: durationMin,
      reason: blockReason || undefined,
    });
    toast({ title: 'Interval blocat', description: `${startTime} — ${minutesToTime(timeToMinutes(startTime) + durationMin)}` });
    setOpen(false);
    setShowBlock(false);
    setBlockDuration('30');
    setBlockReason('');
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setShowBlock(false); }}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start" side="right">
        {!showBlock ? (
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="sm" className="justify-start gap-2 text-sm" onClick={handleNewAppointment}>
              <Plus className="h-4 w-4 text-primary" /> Programare nouă
            </Button>
            <Button variant="ghost" size="sm" className="justify-start gap-2 text-sm" onClick={() => setShowBlock(true)}>
              <Lock className="h-4 w-4 text-muted-foreground" /> Blocare interval
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 p-1">
            <p className="text-xs font-semibold text-foreground">Blocare de la {startTime}</p>
            <div>
              <label className="text-[11px] text-muted-foreground">Durată</label>
              <Select value={blockDuration} onValueChange={setBlockDuration}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minute</SelectItem>
                  <SelectItem value="30">30 minute</SelectItem>
                  <SelectItem value="60">1 oră</SelectItem>
                  <SelectItem value="120">2 ore</SelectItem>
                  <SelectItem value="rest">Restul zilei</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Motiv (opțional)</label>
              <Input
                className="h-8 text-xs"
                placeholder="Pauză, Personal..."
                value={blockReason}
                onChange={e => setBlockReason(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleBlock}>Confirmă</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowBlock(false)}>Anulează</Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
