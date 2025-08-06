import React from 'react';
import { useFormValidation } from '../hooks/useFormValidation';

interface LoginFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

const ExampleLoginForm: React.FC = () => {
  const {
    getFieldProps,
    validateAll,
    isValid,
    resetForm,
    getValue
  } = useFormValidation<LoginFormData>(
    {
      email: '',
      password: '',
      confirmPassword: ''
    },
    {
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        custom: (value) => {
          if (value.includes('spam')) {
            return 'Email cannot contain "spam"';
          }
          return null;
        }
      },
      password: {
        required: true,
        minLength: 8,
        custom: (value) => {
          if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            return 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
          }
          return null;
        }
      },
      confirmPassword: {
        required: true,
        custom: (value) => {
          if (value !== getValue('password')) {
            return 'Passwords do not match';
          }
          return null;
        }
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateAll()) {
      console.log('Form is valid!', {
        email: getValue('email'),
        password: getValue('password')
      });
      // Here you would typically make an API call
      alert('Form submitted successfully!');
      resetForm();
    } else {
      console.log('Form has validation errors');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Example Login Form</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            {...getFieldProps('email')}
            type="email"
            id="email"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              getFieldProps('email').error ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
          />
          {getFieldProps('email').error && (
            <p className="mt-1 text-sm text-red-600">{getFieldProps('email').error}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            {...getFieldProps('password')}
            type="password"
            id="password"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              getFieldProps('password').error ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your password"
          />
          {getFieldProps('password').error && (
            <p className="mt-1 text-sm text-red-600">{getFieldProps('password').error}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            {...getFieldProps('confirmPassword')}
            type="password"
            id="confirmPassword"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              getFieldProps('confirmPassword').error ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Confirm your password"
          />
          {getFieldProps('confirmPassword').error && (
            <p className="mt-1 text-sm text-red-600">{getFieldProps('confirmPassword').error}</p>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={!isValid}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Form Status: {isValid ? '✅ Valid' : '❌ Invalid'}
        </p>
      </div>
    </div>
  );
};

export default ExampleLoginForm;
