'use client';

import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import Modal from '@/components/ui/premium/Modal';

type AnimalKind = 'dog' | 'cat';

type AnimalDeleteConfirmModalProps = {
  open: boolean;
  itemName: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirming?: boolean;
};

function pickAnimal(): AnimalKind {
  return Math.random() < 0.5 ? 'dog' : 'cat';
}

/** Soft whoosh/bark via Web Audio — only plays when unmuted after a user gesture. */
function playSoftCue(kind: AnimalKind) {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(kind === 'dog' ? 220 : 440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      kind === 'dog' ? 140 : 660,
      ctx.currentTime + 0.18
    );
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    void ctx.resume();
    setTimeout(() => void ctx.close(), 400);
  } catch {
    // Ignore audio failures (autoplay / unsupported).
  }
}

function AnimalScene({ kind }: { kind: AnimalKind }) {
  return (
    <div className="relative mx-auto h-28 w-40 overflow-hidden">
      <div className="absolute inset-x-4 bottom-2 h-2 rounded-full bg-on-surface/10" />
      <div
        className="absolute left-1/2 top-3 -translate-x-1/2 select-none text-5xl animate-bounce"
        aria-hidden
      >
        {kind === 'dog' ? '🐕' : '🐈'}
      </div>
      <p className="absolute inset-x-0 bottom-6 text-center text-[10px] font-semibold text-on-surface-variant">
        {kind === 'dog' ? 'Woof — double-check?' : 'Meow — are you sure?'}
      </p>
    </div>
  );
}

export default function AnimalDeleteConfirmModal({
  open,
  itemName,
  onCancel,
  onConfirm,
  confirming = false,
}: AnimalDeleteConfirmModalProps) {
  const [animal, setAnimal] = useState<AnimalKind>('dog');
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    if (open) {
      setAnimal(pickAnimal());
      setSoundOn(false);
    }
  }, [open]);

  const handleToggleSound = () => {
    setSoundOn((prev) => {
      const next = !prev;
      if (next) playSoftCue(animal);
      return next;
    });
  };

  const handleConfirm = () => {
    if (soundOn) playSoftCue(animal);
    onConfirm();
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={`Remove “${itemName}”?`}
      description="This removes the product from your catalog. Stock history stays for audit."
      size="md"
    >
      <div className="space-y-4">
        <AnimalScene kind={animal} />
        <p className="text-xs text-on-surface-variant text-center">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-on-surface">{itemName}</span>?
        </p>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleToggleSound}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant hover:text-on-surface px-2 py-1.5 rounded-lg border border-outline-variant/50"
            aria-pressed={soundOn}
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            {soundOn ? 'Sound on' : 'Sound muted'}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={confirming}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-outline-variant hover:bg-surface-container/40 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={confirming}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-destructive text-white hover:opacity-90 disabled:opacity-50"
            >
              {confirming ? 'Removing…' : 'Remove'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
