'use client';
import { useEffect, useRef, useState } from 'react';
import { Camera, RotateCcw, Check } from 'lucide-react';

const ANGLES = ['Vue d\'ensemble', 'Plaque signalétique', 'Zone du défaut'];

export interface CapturedShot { angle: string; dataUrl: string }

export default function CameraCapture({ onComplete }: { onComplete?: (shots: CapturedShot[]) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [shots, setShots] = useState<CapturedShot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const idx = shots.length;
  const done = idx >= ANGLES.length;

  useEffect(() => {
    let active = true;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, audio: false,
        });
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setError('Caméra indisponible — utilisez l\'import de fichier.');
      }
    }
    if (!done) start();
    return () => { active = false; streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, [done]);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    const next = [...shots, { angle: ANGLES[idx], dataUrl }];
    setShots(next);
    if (next.length >= ANGLES.length) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      onComplete?.(next);
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = [...shots, { angle: ANGLES[idx], dataUrl: reader.result as string }];
      setShots(next);
      if (next.length >= ANGLES.length) onComplete?.(next);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="glass p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="label-mono">Capture guidée — {Math.min(idx + 1, ANGLES.length)}/{ANGLES.length}</span>
        {!done && <span className="text-amber text-sm font-medium">📸 {ANGLES[idx]}</span>}
      </div>

      {!done ? (
        <div className="relative aspect-video overflow-hidden rounded-lg bg-ink">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-6 border-2 border-amber/60 rounded-lg" />
          {error && (
            <div className="absolute inset-0 grid place-items-center text-center p-4 text-sm text-steel">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg bg-ok/10 border border-ok/30 p-4 text-ok text-sm flex items-center gap-2">
          <Check size={18} /> {ANGLES.length} angles capturés.
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {!done && (
          <button onClick={capture} className="btn-primary">
            <Camera size={16} /> Capturer
          </button>
        )}
        {!done && (
          <label className="btn-ghost cursor-pointer">
            Importer
            <input type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
          </label>
        )}
        {shots.length > 0 && (
          <button onClick={() => setShots([])} className="btn-ghost">
            <RotateCcw size={16} /> Recommencer
          </button>
        )}
      </div>

      {shots.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {shots.map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={s.dataUrl} alt={s.angle} className="aspect-square w-full rounded-md object-cover border border-white/10" />
          ))}
        </div>
      )}
    </div>
  );
}
