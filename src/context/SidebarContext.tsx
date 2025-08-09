import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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


  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      // Auto-collapse on tablets
      if (width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT) {
        setState(prev => {
          if (prev.isExpanded) {
            const newState = { ...prev, isExpanded: false };
            savePreferences(newState);
            return newState;
          }
          return prev;
        });
      }
      
      // Close mobile overlay when resizing to larger screens
      if (width >= MOBILE_BREAKPOINT && state.isOpen) {
        setState(prev => ({ ...prev, isOpen: false }));
      }
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [state.isOpen, savePreferences]);

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

// Hook to check if we're on mobile
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};