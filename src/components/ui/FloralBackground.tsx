import React, { useEffect, useState } from 'react';

const FloralSVG = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg 
    viewBox="0 0 400 600" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    style={style}
  >
    <path 
      d="M200 600C200 400 150 300 100 200C50 100 150 50 200 150C250 250 350 150 300 50C250 -50 200 50 200 150M200 150C220 100 280 80 320 120M200 300C160 250 100 240 70 280M200 450C240 400 300 410 330 370" 
      stroke="#D4AF37" 
      strokeWidth="0.5" 
      strokeLinecap="round"
      opacity="0.15"
    />
    <circle cx="100" cy="200" r="2" fill="#D4AF37" opacity="0.1" />
    <circle cx="320" cy="120" r="1.5" fill="#D4AF37" opacity="0.1" />
    <circle cx="70" cy="280" r="1.5" fill="#D4AF37" opacity="0.1" />
  </svg>
);

const LeafSVG = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg 
    viewBox="0 0 300 400" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    style={style}
  >
    <path 
      d="M50 350C100 300 150 150 100 50C200 100 250 250 200 350M125 200C160 180 200 190 220 220M115 280C140 270 170 280 185 305" 
      stroke="#D4AF37" 
      strokeWidth="0.5" 
      strokeLinecap="round"
      opacity="0.12"
    />
  </svg>
);

export const FloralBackground = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-50">
      {/* Top Left */}
      <FloralSVG 
        className="absolute -left-20 -top-20 w-[400px] h-auto"
        style={{ transform: `translateY(${offset * 0.1}px) rotate(-15deg)` }}
      />
      
      {/* Bottom Right */}
      <LeafSVG 
        className="absolute -right-10 bottom-20 w-[300px] h-auto"
        style={{ transform: `translateY(${-offset * 0.15}px) rotate(15deg)` }}
      />

      {/* Mid Left */}
      <LeafSVG 
        className="absolute -left-10 top-1/2 w-[250px] h-auto"
        style={{ transform: `translateY(${offset * 0.05}px) rotate(45deg)` }}
      />

      {/* Top Right */}
      <FloralSVG 
        className="absolute -right-20 top-40 w-[350px] h-auto"
        style={{ transform: `translateY(${offset * 0.08}px) scaleX(-1) rotate(10deg)` }}
      />
    </div>
  );
};
