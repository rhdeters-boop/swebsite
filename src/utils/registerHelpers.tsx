import { Loader2, Check, X } from 'lucide-react';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken';

export const getUsernameStatusIcon = (status: UsernameStatus) => {
  switch (status) {
    case 'checking':
      return <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />;
    case 'available':
      return <Check className="h-4 w-4 text-green-400" />;
    case 'taken':
      return <X className="h-4 w-4 text-red-400" />;
    default:
      return null;
  }
};

export const getUsernameError = (status: UsernameStatus) => {
  if (status === 'taken') {
    return 'Username is already taken';
  }
  return '';
};

export const getPasswordError = (password: string, confirmPassword: string) => {
  if (confirmPassword && password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return '';
};
