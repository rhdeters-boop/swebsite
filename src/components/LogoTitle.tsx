import React from 'react';

const LogoTitle: React.FC = () => {
  return (
    // Change 'items-center' to 'items-start' to align the text vertically
    <div className="flex flex-col items-start font-serif font-bold tracking-wider">
      <div className="flex items-baseline">
        <h1 className="text-8xl md:text-12xl text-main text-shadow-glow">
          VOID
        </h1>
        <span className="text-5xl md:text-7xl text-body mx-2">
          OF
        </span>
      </div>
      <h1 className="text-8xl md:text-12xl text-seductive-dark text-shadow-glow -mt-4">
        DESIRE
      </h1>
    </div>
  );
};

export default LogoTitle;