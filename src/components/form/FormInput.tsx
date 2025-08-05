import React from 'react';

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
  placeholder,
  required = false,
  disabled = false,
  className = "",
  error,
  pattern,
  title,
  rightElement
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`form-input ${rightElement ? 'pr-10' : ''} ${
            error ? 'border-red-500/50' : ''
          } ${className}`}
          placeholder={placeholder}
          pattern={pattern}
          title={title}
        />
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
