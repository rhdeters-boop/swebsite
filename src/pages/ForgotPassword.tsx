import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Mail, Loader2 } from 'lucide-react';
import axios from 'axios';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await axios.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center py-2 sm:py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <Mail className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-text-primary">
              Check your email
            </h2>
            <p className="mt-4 text-text-secondary">
              If an account with <strong>{email}</strong> exists, we've sent a password reset link to your email.
            </p>
            <p className="mt-2 text-caption">
              Check your spam folder if you don't see it in your inbox.
            </p>
          </div>

          <div className="card-elevated">
            <div className="space-y-4">
              <div className="alert-info">
                <h3 className="font-medium">What's next?</h3>
                <ul className="mt-2 text-sm space-y-1">
                  <li>• Click the link in your email</li>
                  <li>• The link expires in 1 hour</li>
                  <li>• Create a new secure password</li>
                </ul>
              </div>

              <div className="text-center">
                <p className="text-text-secondary">
                  Didn't receive the email?{' '}
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                    }}
                    className="text-void-accent-light hover:text-seductive-light font-medium transition-colors duration-200"
                  >
                    Try again
                  </button>
                </p>
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-text-secondary hover:text-void-accent-light transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-2 sm:py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-void-accent" fill="currentColor" />
          </div>
          <h2 className="text-3xl font-bold gradient-text">
            Forgot your password?
          </h2>
          <p className="mt-2 text-text-secondary">
            No worries! Enter your email and we'll send you a reset link.
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
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Enter your email address"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Reset Link
                </>
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-text-secondary hover:text-void-accent-light transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </Link>
            </div>
          </form>
        </div>

        {/* Additional help */}
        <div className="text-center">
          <p className="text-caption">
            Don't have an account?{' '}
            <Link to="/register" className="text-void-accent-light hover:text-seductive-light font-medium transition-colors duration-200">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
