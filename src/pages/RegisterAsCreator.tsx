import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Star } from 'lucide-react';
import AuthSection from '../components/auth/AuthSection';
import FormInput from '../components/form/FormInput';
import PasswordInput from '../components/form/PasswordInput';
import VoidLogo from '../components/VoidLogo';
import BackButton from '../components/BackButton';
import { useUsernameValidation } from '../hooks/useUsernameValidation';
import { usePasswordValidation } from '../hooks/usePasswordValidation';
import { getUsernameStatusIcon, getUsernameError } from '../utils/registerHelpers';
import { getLastVisitedPage } from '../hooks/useNavigationTracking';

const RegisterAsCreator: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    wantsToBecomeCreator: true, // This flag indicates creator registration
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
        wantsToBecomeCreator: true, // Flag for creator registration
      });
      
      // Check if we should redirect to the last visited page or create creator profile
      const lastPage = getLastVisitedPage();
      const shouldGoToCreateProfile = lastPage === '/dashboard' || !lastPage;
      
      if (shouldGoToCreateProfile) {
        navigate('/create-creator-profile');
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
    <div className=" min-h-screen flex flex-col items-center justify-center px-4 py-2">
      <BackButton />

      <AuthSection
        title={
          <div className="flex items-center justify-center space-x-2">
            <span>Join as a <span className="text-seductive-dark text-shadow-void-glow">Creator</span></span>
          </div>
        }
        subtitle="First create an account"
        icon={<VoidLogo className="h-12 w-12" />}
        footer={
          <>
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-void-accent-light hover:text-seductive-light font-medium transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
            <div className="mt-4 text-sm text-gray-500">
              <p>🎨 Create content • 💰 Earn money • 🌟 Build your brand</p>
            </div>
          </>
        }
      >
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Display error message */}
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
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="creator@example.com"
          required
        />

        <PasswordInput
          id="password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          validation={passwordValidation}
          showValidation={true}
          required
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
          required
        />

        {/* Password match validation message */}
        {formData.confirmPassword && !passwordsMatch && (
          <p className="text-sm text-red-400 -mt-2">Passwords do not match</p>
        )}

        <button
          type="submit"
          disabled={isLoading || !isPasswordValid || !passwordsMatch || usernameStatus === 'taken'}
          className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Creating Creator Account...
            </>
          ) : (
            <>
              <Star className="h-5 w-5 mr-2" />
              Become a Creator
            </>
          )}
        </button>
      </form>
    </AuthSection>
    </div>
  );
};

export default RegisterAsCreator;
