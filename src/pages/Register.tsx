import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import AuthSection from '../components/auth/AuthSection';
import FormInput from '../components/form/FormInput';
import PasswordInput from '../components/form/PasswordInput';
import VoidLogo from '../components/VoidLogo';
import BackButton from '../components/BackButton';
import { useUsernameValidation } from '../hooks/useUsernameValidation';
import { usePasswordValidation } from '../hooks/usePasswordValidation';
import { getUsernameStatusIcon, getUsernameError, getPasswordError } from '../utils/registerHelpers';
import { getLastVisitedPage } from '../hooks/useNavigationTracking';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Custom hooks
  const usernameStatus = useUsernameValidation(formData.username);
  const { validation: passwordValidation, validatePassword, isPasswordValid } = usePasswordValidation();
  
  // Derived state
  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      validatePassword(value);
    }

    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      return;
    }

    if (!passwordsMatch) {
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      // Check if we should redirect to the last visited page or create profile
      const lastPage = getLastVisitedPage();
      const shouldGoToCreateProfile = lastPage === '/dashboard' || !lastPage;
      
      if (shouldGoToCreateProfile) {
        navigate('/create-profile');
      } else {
        navigate(lastPage, { replace: true });
      }
    } catch (err) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e).catch(console.error);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <BackButton />

      <AuthSection
        title={
          <>
            Enter the <span className="text-lust-violet text-shadow-void-glow">Void</span>
          </>
        }
        subtitle="Create your account - we'll set up your profile next"
        icon={<VoidLogo className="h-12 w-12" />}
        footer={
          <>
                      <p className="text-text-secondary">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-void-accent-light hover:text-seductive-light transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
            <div className="mt-4 text-caption">
              <p>🎉 Join creators • 💳 Secure payments • 🔒 Private & protected</p>
            </div>
          </>
        }
      >
      <form onSubmit={onSubmit} className="space-y-6">
        {error && (
          <div className="alert-error">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <FormInput
            id="username"
            name="username"
            label="Username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Your unique username"
            pattern="^[a-zA-Z0-9_]+$"
            title="Username can only contain letters, numbers, and underscores"
            className={usernameStatus === 'taken' ? 'form-input-error' : 
                     usernameStatus === 'available' ? 'form-input-success' : ''}
            error={getUsernameError(usernameStatus)}
            rightElement={getUsernameStatusIcon(usernameStatus)}
            required
          />
          {usernameStatus === 'available' && (
            <p className="form-success">Username is available</p>
          )}
        </div>

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
          placeholder="Create a password"
          showValidation={true}
          validation={passwordValidation}
          showPassword={showPassword}
          onTogglePassword={() => { setShowPassword(!showPassword); }}
          required
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          className={formData.confirmPassword && !passwordsMatch ? 'form-input-error' : ''}
          showPassword={showPassword}
          onTogglePassword={() => { setShowPassword(!showPassword); }}
          required
        />
        {getPasswordError(formData.password, formData.confirmPassword) && (
          <p className="form-error">{getPasswordError(formData.password, formData.confirmPassword)}</p>
        )}

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-void-accent focus:ring-void-accent border-border-muted rounded bg-background-secondary"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-text-secondary">
            I agree to the{' '}
            <Link to="/terms" className="text-void-accent-light hover:text-seductive-light transition-colors duration-200">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-void-accent-light hover:text-seductive-light transition-colors duration-200">
              Privacy Policy
            </Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isPasswordValid || !passwordsMatch || usernameStatus === 'taken'}
          className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </AuthSection>
    </div>
  );
};

export default Register;
