import React, { useState } from 'react';

interface FormInputProps {
  id: string;
  name: string;
  type?: 'text' | 'email' | 'url' | 'tel';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  pattern?: string;
  title?: string;
  rightElement?: React.ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  type = 'text',
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  className = "",
  error,
  pattern,
  title,
  rightElement
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Label should be positioned as floating when focused or has value
  const isLabelFloating = isFocused || value.length > 0;
  return (
    <div className="relative">
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`form-input pt-6 ${rightElement ? 'pr-10' : ''} ${
            error ? 'border-red-500/50' : ''
          } ${className}`}
          placeholder={isLabelFloating ? "" : ""}
          pattern={pattern}
          title={title}
        />
        <label 
          htmlFor={id} 
          className={`absolute left-3 px-2 text-sm font-medium text-gray-300 transition-all duration-200 pointer-events-none ${
            isLabelFloating 
              ? '-top-2.5 bg-void-dark-900 text-gray-300' 
              : 'top-1/2 -translate-y-1/2 text-gray-400'
          }`}
        >
          {label}
        </label>
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default FormInput;
