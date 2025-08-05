import React from 'react';
import { Circle, Zap } from 'lucide-react';

const VoidLogo: React.FC<{ className?: string }> = ({ className = "w-24 h-32" }) => {
  return (
    <div className={`relative flex items-end justify-center ${className}`}>
      <Circle className="h-5/6 w-5/6 text-void-accent group-hover:scale-110 transition-transform duration-200" />
      <Zap className="h-1/2 w-1/3 text-seductive-light absolute animate-pulse drop-shadow-lg filter brightness-125 contrast-125" style={{ top: '2%', right: '12%' }} />
      <Zap className="h-1/2 w-1/3 text-seductive-light absolute animate-pulse drop-shadow-lg filter brightness-125 contrast-125" style={{ top: '2%', left: '12%' }} />
    </div>
  );
};

export default VoidLogo;
