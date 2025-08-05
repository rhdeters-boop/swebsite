import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import AuthCard from '../components/auth/AuthCard';
import FormInput from '../components/form/FormInput';
import PasswordInput from '../components/form/PasswordInput';
import VoidLogo from '../components/VoidLogo';
import BackButton from '../components/BackButton';
import { useUsernameValidation } from '../hooks/useUsernameValidation';
import { usePasswordValidation } from '../hooks/usePasswordValidation';
import { getUsernameStatusIcon, getUsernameError, getPasswordError } from '../utils/registerHelpers';

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
      navigate('/create-profile');
    } catch (err) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <BackButton />

      <AuthCard
        title={
          <>
            Enter the <span className="text-lust-violet text-shadow-void-glow">Void</span>
          </>
        }
        subtitle="Create your account - we'll set up your profile next"
        icon={<VoidLogo className="h-12 w-12" />}
        footer={
          <>
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-void-accent-light hover:text-seductive-light font-medium transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
            <div className="mt-4 text-sm text-gray-400">
              <p>🎉 Join creators • 💳 Secure payments • 🔒 Private & protected</p>
            </div>
          </>
        }
      >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
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
            className={usernameStatus === 'taken' ? 'border-red-500/50' : 
                     usernameStatus === 'available' ? 'border-green-500/50' : ''}
            error={getUsernameError(usernameStatus)}
            rightElement={getUsernameStatusIcon(usernameStatus)}
            required
          />
          {usernameStatus === 'available' && (
            <p className="mt-1 text-sm text-green-400">Username is available</p>
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
          onTogglePassword={() => setShowPassword(!showPassword)}
          required
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          className={formData.confirmPassword && !passwordsMatch ? 'border-red-500/50' : ''}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          required
        />
        {getPasswordError(formData.password, formData.confirmPassword) && (
          <p className="mt-1 text-sm text-red-400">{getPasswordError(formData.password, formData.confirmPassword)}</p>
        )}

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-void-accent focus:ring-void-accent border-void-500/30 rounded bg-void-dark-900"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
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
    </AuthCard>
    </>
  );
};

export default Register;
