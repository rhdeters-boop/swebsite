import React, { useEffect, useRef } from 'react';
import { useSidebar } from '../../context/SidebarContext';

interface SidebarMobileOverlayProps {
  children: React.ReactNode;
}

const SidebarMobileOverlay: React.FC<SidebarMobileOverlayProps> = ({ children }) => {
  const { isOpen, toggleOpen } = useSidebar();
  const overlayRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number | null>(null);

  // Handle touch gestures for closing
  useEffect(() => {
    if (!isOpen) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        startXRef.current = touch.clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startXRef.current === null) return;
      
      const touch = e.touches[0];
      if (touch) {
        const currentX = touch.clientX;
        const diff = currentX - startXRef.current;
        
        // If swiping left more than 50px, close the sidebar
        if (diff < -50) {
          toggleOpen();
          startXRef.current = null;
        }
      }
    };

    const handleTouchEnd = () => {
      startXRef.current = null;
    };

    const overlay = overlayRef.current;
    if (overlay) {
      overlay.addEventListener('touchstart', handleTouchStart);
      overlay.addEventListener('touchmove', handleTouchMove);
      overlay.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (overlay) {
        overlay.removeEventListener('touchstart', handleTouchStart);
        overlay.removeEventListener('touchmove', handleTouchMove);
        overlay.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isOpen, toggleOpen]);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        onClick={toggleOpen}
        aria-hidden="true"
      />

      {/* Sidebar container */}
      <div
        ref={overlayRef}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-background-primary border-r border-border-primary
                   shadow-2xl md:hidden transform transition-transform duration-300 ease-out"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {children}
      </div>
    </>
  );
};

export default SidebarMobileOverlay;