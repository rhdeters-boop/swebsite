import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isMobile as detectMobile } from '../utils/mobileDetection';

interface SidebarContextState {
  isExpanded: boolean;
  isOpen: boolean; // For mobile overlay
  expandedSections: string[];
}

interface SidebarContextValue extends SidebarContextState {
  toggleExpanded: () => void;
  toggleOpen: () => void;
  toggleSection: (sectionId: string) => void;
}

const STORAGE_KEY = 'sidebar-preferences';
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

// Default context value
const defaultValue: SidebarContextValue = {
  isExpanded: true,
  isOpen: false,
  expandedSections: [],
  toggleExpanded: () => {},
  toggleOpen: () => {},
  toggleSection: () => {}
};

const SidebarContext = createContext<SidebarContextValue>(defaultValue);

interface SidebarProviderProps {
  children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  // Initialize state from localStorage or defaults
  const [state, setState] = useState<SidebarContextState>(() => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          isExpanded: parsed.isExpanded ?? true,
          isOpen: false, // Always start with mobile overlay closed
          expandedSections: parsed.expandedSections ?? []
        };
      }
    } catch (error) {
      console.error('Error reading sidebar preferences:', error);
    }
    
    return {
      isExpanded: true,
      isOpen: false,
      expandedSections: []
    };
  });

  // Save preferences to localStorage
  const savePreferences = useCallback((newState: Partial<SidebarContextState>) => {
    try {
      const toSave = {
        isExpanded: newState.isExpanded ?? state.isExpanded,
        expandedSections: newState.expandedSections ?? state.expandedSections
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving sidebar preferences:', error);
    }
  }, [state]);

  // Toggle expanded/collapsed state
  const toggleExpanded = useCallback(() => {
    setState(prev => {
      const newState = { ...prev, isExpanded: !prev.isExpanded };
      savePreferences(newState);
      return newState;
    });
  }, [savePreferences]);

  // Toggle mobile overlay
  const toggleOpen = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setState(prev => {
      const isExpanded = prev.expandedSections.includes(sectionId);
      const expandedSections = isExpanded
        ? prev.expandedSections.filter(id => id !== sectionId)
        : [...prev.expandedSections, sectionId];
      
      const newState = { ...prev, expandedSections };
      savePreferences(newState);
      return newState;
    });
  }, [savePreferences]);


  // Handle window resize and hover capability changes
  useEffect(() => {
    const handleChange = () => {
      const isMobileDevice = detectMobile();
      
      // Close mobile overlay when switching from mobile to non-mobile device
      if (!isMobileDevice && state.isOpen) {
        setState(prev => ({ ...prev, isOpen: false }));
      }
    };

    handleChange(); // Check on mount

    // Listen for both resize and hover capability changes
    const mediaQuery = window.matchMedia('(any-hover: none)');
    
    window.addEventListener('resize', handleChange);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleChange);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [state.isOpen]);

  // Listen for storage events to sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setState(prev => ({
            ...prev,
            isExpanded: parsed.isExpanded ?? prev.isExpanded,
            expandedSections: parsed.expandedSections ?? prev.expandedSections
          }));
        } catch (error) {
          console.error('Error syncing sidebar preferences:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close mobile overlay when clicking outside or pressing Escape
  useEffect(() => {
    if (!state.isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setState(prev => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [state.isOpen]);

  const value: SidebarContextValue = {
    ...state,
    toggleExpanded,
    toggleOpen,
    toggleSection
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

// Hook to use sidebar context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// Hook to check if we're on mobile using hover capability and screen size detection
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => detectMobile());

  useEffect(() => {
    // Listen for both hover capability changes AND resize events
    const mediaQuery = window.matchMedia('(any-hover: none)');
    
    const handleChange = () => {
      setIsMobile(detectMobile());
    };

    const handleResize = () => {
      setIsMobile(detectMobile());
    };

    // Add resize listener for screen size changes
    window.addEventListener('resize', handleResize);

    // Add hover capability listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return isMobile;
};