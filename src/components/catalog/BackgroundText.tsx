import { useEffect, useState } from 'react';

export function BackgroundText() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * 0.15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
      <div
        className="absolute whitespace-nowrap font-serif text-[18vw] md:text-[14vw] font-bold text-accent/[0.03] uppercase tracking-[0.15em] leading-none"
        style={{
          top: '30%',
          transform: `translateX(${-offset}px)`,
          transition: 'transform 0.1s linear',
        }}
      >
        FLOR DO CAMPO — EXCLUSIVO — FLOR DO CAMPO — EXCLUSIVO —
      </div>
      <div
        className="absolute whitespace-nowrap font-serif text-[12vw] md:text-[9vw] font-bold text-accent/[0.02] uppercase tracking-[0.2em] leading-none"
        style={{
          top: '65%',
          transform: `translateX(${offset * 0.7}px)`,
          transition: 'transform 0.1s linear',
        }}
      >
        BOUTIQUE FLORAL — PREMIUM — BOUTIQUE FLORAL — PREMIUM —
      </div>
    </div>
  );
}
