import React, { createContext, useContext, useState, ReactNode } from 'react';
import Alert, { AlertProps } from '../components/Alert';

interface AlertItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface AlertContextType {
  showAlert: (type: AlertItem['type'], message: string, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  clearAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const showAlert = (type: AlertItem['type'], message: string, duration = 5000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newAlert: AlertItem = { id, type, message, duration };
    
    setAlerts(prev => [...prev, newAlert]);
  };

  const showSuccess = (message: string, duration?: number) => {
    showAlert('success', message, duration);
  };

  const showError = (message: string, duration?: number) => {
    showAlert('error', message, duration);
  };

  const showWarning = (message: string, duration?: number) => {
    showAlert('warning', message, duration);
  };

  const showInfo = (message: string, duration?: number) => {
    showAlert('info', message, duration);
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const contextValue: AlertContextType = {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAlerts,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {/* Render alerts */}
      {alerts.map((alert, index) => (
        <Alert
          key={alert.id}
          id={alert.id}
          type={alert.type}
          message={alert.message}
          duration={alert.duration}
          onClose={removeAlert}
          index={index}
        />
      ))}
    </AlertContext.Provider>
  );
};

export default AlertContext;
