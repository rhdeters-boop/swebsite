import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  label: string;
  showValidation?: boolean;
  validation?: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
  };
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  value,
  onChange,
  required = false,
  disabled = false,
  className = "",
  label,
  showValidation = false,
  validation,
  showPassword: externalShowPassword,
  onTogglePassword
}) => {
  const [internalShowPassword, setInternalShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Use external control if provided, otherwise use internal state
  const showPassword = externalShowPassword !== undefined ? externalShowPassword : internalShowPassword;
  const togglePassword = onTogglePassword || (() => setInternalShowPassword(!internalShowPassword));
  
  // Label should be positioned as floating when focused or has value
  const isLabelFloating = isFocused || value.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          required={required}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`form-input pt-6 pr-10 ${className}`}
          placeholder=""
        />
        <label 
          htmlFor={id} 
          className={`absolute left-3 px-2 text-sm font-medium text-gray-300 transition-all duration-200 pointer-events-none ${
            isLabelFloating 
              ? '-top-2.5 bg-background-secondary text-gray-300' 
              : 'top-1/2 -translate-y-1/2 text-gray-400'
          }`}
        >
          {label}
        </label>
        <button
          type="button"
          onClick={togglePassword}
          disabled={disabled}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 disabled:opacity-50"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      {showValidation && validation && value && (
        <div className="mt-2 space-y-1">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <ValidationItem isValid={validation.length} text="At least 8 characters" />
            <ValidationItem isValid={validation.uppercase} text="One uppercase letter" />
            <ValidationItem isValid={validation.lowercase} text="One lowercase letter" />
            <ValidationItem isValid={validation.number} text="One number" />
            <ValidationItem isValid={validation.specialChar} text="One special character" />
          </div>
        </div>
      )}
    </div>
  );
};

const ValidationItem: React.FC<{ isValid: boolean; text: string }> = ({ isValid, text }) => (
  <div className={`flex items-center text-sm ${isValid ? 'text-green-400' : 'text-gray-500'}`}>
    {isValid ? (
      <span className="text-green-400 mr-2">✓</span>
    ) : (
      <span className="text-gray-500 mr-2">○</span>
    )}
    {text}
  </div>
);

export default PasswordInput;
