import React, { useEffect, useState } from 'react';
import { Flower, Flower2, Leaf, Sprout } from 'lucide-react';

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
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Top Left - Large Elegant Flower */}
      <div 
        className="absolute -left-20 -top-20 opacity-[0.08] blur-[2px]"
        style={{ transform: `translateY(${offset * 0.1}px) rotate(-15deg)` }}
      >
        <Flower2 size={450} strokeWidth={0.5} color="#D4AF37" />
      </div>
      
      {/* Bottom Right - Cascading Leaves */}
      <div 
        className="absolute -right-20 bottom-10 opacity-[0.07] blur-[3px]"
        style={{ transform: `translateY(${-offset * 0.15}px) rotate(160deg)` }}
      >
        <Leaf size={400} strokeWidth={0.5} color="#D4AF37" />
      </div>

      {/* Mid Left - Subtle Sprout */}
      <div 
        className="absolute -left-32 top-1/2 opacity-[0.06] blur-[4px]"
        style={{ transform: `translateY(${offset * 0.05}px) rotate(45deg)` }}
      >
        <Sprout size={350} strokeWidth={0.5} color="#D4AF37" />
      </div>

      {/* Top Right - Another Flower Variant */}
      <div 
        className="absolute -right-24 top-40 opacity-[0.08] blur-[2px]"
        style={{ transform: `translateY(${offset * 0.08}px) rotate(25deg)` }}
      >
        <Flower size={500} strokeWidth={0.5} color="#D4AF37" />
      </div>

      {/* Extra Detail - Mid Right Leaf */}
      <div 
        className="absolute right-[10%] bottom-[30%] opacity-[0.05] blur-[5px]"
        style={{ transform: `translateY(${-offset * 0.12}px) rotate(-30deg)` }}
      >
        <Leaf size={300} strokeWidth={0.5} color="#D4AF37" />
      </div>
    </div>
  );
};
