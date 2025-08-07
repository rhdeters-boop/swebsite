import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Heart, Eye, EyeOff, Check, X, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setIsVerifying(false);
      return;
    }

    // Verify token validity
    const verifyToken = async () => {
      try {
        await axios.get(`/auth/verify-reset-token/${token}`);
        setIsValidToken(true);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid or expired reset link.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const validatePassword = (password: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      validatePassword(value);
    }

    if (error) setError('');
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await axios.post('/auth/reset-password', {
        token,
        password: formData.password,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationItem: React.FC<{ isValid: boolean; text: string }> = ({ isValid, text }) => (
    <div className={`flex items-center text-sm ${isValid ? 'text-success' : 'text-text-muted'}`}>
      {isValid ? (
        <Check className="h-4 w-4 mr-2" />
      ) : (
        <X className="h-4 w-4 mr-2" />
      )}
      {text}
    </div>
  );

  // Loading state while verifying token
  if (isVerifying) {
    return (
      <div className="flex items-center justify-center py-2 sm:py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-12 w-12 text-void-accent animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">
            Verifying reset link...
          </h2>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="flex items-center justify-center py-2 sm:py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-text-primary">
              Password Reset Successful!
            </h2>
            <p className="mt-4 text-text-secondary">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
          </div>

          <div className="card-elevated">
            <div className="space-y-4">
              <div className="alert-success">
                <h3 className="font-medium">What's next?</h3>
                <ul className="mt-2 text-sm space-y-1">
                  <li>• Log in with your new password</li>
                  <li>• Store your password securely</li>
                  <li>• Consider enabling two-factor authentication</li>
                </ul>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full btn-primary"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state (invalid token)
  if (!isValidToken) {
    return (
      <div className="flex items-center justify-center py-2 sm:py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Heart className="h-12 w-12 text-void-accent" fill="currentColor" />
            </div>
            <h2 className="text-3xl font-bold text-text-primary">
              Invalid Reset Link
            </h2>
            <p className="mt-4 text-text-secondary">
              {error}
            </p>
          </div>

          <div className="card-elevated">
            <div className="space-y-4">
              <div className="alert-warning">
                <h3 className="font-medium">What happened?</h3>
                <ul className="mt-2 text-sm space-y-1">
                  <li>• The reset link may have expired (links expire after 1 hour)</li>
                  <li>• The link may have already been used</li>
                  <li>• The link may be malformed</li>
                </ul>
              </div>

              <Link
                to="/forgot-password"
                className="w-full btn-primary text-center block"
              >
                Request New Reset Link
              </Link>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-text-secondary hover:text-void-accent-light transition-colors duration-200"
                >
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="flex items-center justify-center py-2 sm:py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-void-accent" fill="currentColor" />
          </div>
          <h2 className="text-3xl font-bold gradient-text">
            Reset Your Password
          </h2>
          <p className="mt-2 text-text-secondary">
            Enter your new password below.
          </p>
        </div>

        {/* Form */}
        <div className="card-elevated">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="alert-error">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="form-label">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input pr-10"
                  placeholder="Enter new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-text-muted" />
                  ) : (
                    <Eye className="h-4 w-4 text-text-muted" />
                  )}
                </button>
              </div>

              {/* Password requirements */}
              {formData.password && (
                <div className="mt-3 space-y-1">
                  <ValidationItem isValid={passwordValidation.length} text="At least 8 characters" />
                  <ValidationItem isValid={passwordValidation.uppercase} text="One uppercase letter" />
                  <ValidationItem isValid={passwordValidation.lowercase} text="One lowercase letter" />
                  <ValidationItem isValid={passwordValidation.number} text="One number" />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input pr-10"
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-text-muted" />
                  ) : (
                    <Eye className="h-4 w-4 text-text-muted" />
                  )}
                </button>
              </div>

              {formData.confirmPassword && (
                <div className="mt-2">
                  {passwordsMatch ? (
                    <div className="flex items-center text-sm text-success">
                      <Check className="h-4 w-4 mr-2" />
                      Passwords match
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-error">
                      <X className="h-4 w-4 mr-2" />
                      Passwords do not match
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid || !passwordsMatch}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
