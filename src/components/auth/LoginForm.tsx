import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import FormInput from '../form/FormInput';
import PasswordInput from '../form/PasswordInput';
import { getLastVisitedPage } from '../../hooks/useNavigationTracking';

interface LoginFormProps {
  onSuccess?: () => void;
  showLinks?: boolean;
  redirectTo?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  showLinks = true, 
  redirectTo 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Priority order: redirectTo prop > location state > last visited page > default dashboard
  const from = redirectTo || 
               (location.state as any)?.from?.pathname || 
               getLastVisitedPage() || 
               '/dashboard';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      <FormInput
        id="email"
        name="email"
        type="email"
        label="Email Address"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
        required
      />

      <PasswordInput
        id="password"
        name="password"
        label="Password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your password"
        showPassword={showPassword}
        onTogglePassword={() => { setShowPassword(!showPassword); }}
        required
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-void-accent focus:ring-void-accent border-border-muted rounded bg-background-secondary"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary">
            Remember me
          </label>
        </div>

        {showLinks && (
          <div className="text-sm">
            <Link 
              to="/forgot-password" 
              className="text-void-accent-light hover:text-seductive-light transition-colors duration-200"
            >
              Forgot password?
            </Link>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Signing In...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      {showLinks && (
        <div className="text-center">
          <p className="text-text-secondary">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-void-accent-light hover:text-seductive-light font-medium transition-colors duration-200"
            >
              Sign up here
            </Link>
          </p>
        </div>
      )}
    </form>
  );
};

export default LoginForm;
