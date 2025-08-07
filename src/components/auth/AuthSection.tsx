import React from 'react';

interface AuthCardProps {
  title: string | React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const AuthSection: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  footer
}) => {
  return (
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto px-4 sm:px-6">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          {icon && (
            <div className="flex justify-center mb-4 sm:mb-6">
              {icon}
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-void-accent-light via-seductive-light to-void-accent bg-clip-text text-transparent">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-abyss-light-gray">
              {subtitle}
            </p>
          )}
        </div>

        {/* Main Content Card */}
        <div className="auth-section">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="text-center">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthSection;
