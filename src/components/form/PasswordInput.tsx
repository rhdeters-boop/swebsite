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
  };
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = "Enter password",
  required = false,
  disabled = false,
  className = "",
  label,
  showValidation = false,
  validation
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`form-input pr-10 ${className}`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
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
          <ValidationItem isValid={validation.length} text="At least 8 characters" />
          <ValidationItem isValid={validation.uppercase} text="One uppercase letter" />
          <ValidationItem isValid={validation.lowercase} text="One lowercase letter" />
          <ValidationItem isValid={validation.number} text="One number" />
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
