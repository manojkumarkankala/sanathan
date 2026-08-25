import { useEffect, useState } from 'react';

interface CountdownProps {
  targetDate: string | null;
  status: 'upcoming' | 'live' | 'completed';
}

export function Countdown({ targetDate, status }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate || status !== 'upcoming') return;
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, status]);

  if (status === 'completed') {
    return (
      <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-success-500 to-success-700 text-white font-heading font-bold text-xl shadow-xl animate-scale-in">
        <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
        FESTIVAL COMPLETED
      </div>
    );
  }

  if (status === 'live') {
    return (
      <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-700 text-white font-heading font-bold text-xl shadow-xl animate-glow">
        <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
        LIVE NOW
      </div>
    );
  }

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-heading font-semibold text-gold text-sm uppercase tracking-widest text-shadow-md">
        Vinayaka Chavithi Starts In
      </p>
      <div className="flex gap-3 sm:gap-4">
        {units.map((unit) => (
          <div key={unit.label} className="flex flex-col items-center">
            <div className="relative">
              <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl bg-gradient-to-br from-maroon to-black border-2 border-gold/40 flex items-center justify-center shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-mandala opacity-20" />
                <span className="text-2xl sm:text-4xl font-display font-bold text-gold relative z-10 tabular-nums">
                  {String(unit.value).padStart(2, '0')}
                </span>
              </div>
            </div>
            <span className="mt-2 text-[10px] sm:text-xs font-heading font-medium text-cream/80 uppercase tracking-wider">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
