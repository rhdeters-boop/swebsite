import { useState, useEffect } from 'react';
import axios from 'axios';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken';

export const useUsernameValidation = (username: string) => {
  const [status, setStatus] = useState<UsernameStatus>('idle');

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 2) {
      setStatus('idle');
      return;
    }

    setStatus('checking');

    try {
      const response = await axios.get(`/auth/check-username?username=${encodeURIComponent(username)}`);
      setStatus(response.data.available ? 'available' : 'taken');
    } catch {
      setStatus('idle');
    }
  };

  useEffect(() => {
    if (!username) {
      setStatus('idle');
      return;
    }

    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  return status;
};
