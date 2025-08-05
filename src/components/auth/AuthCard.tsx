import React from 'react';

interface AuthCardProps {
  title: string | React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  footer
}) => {
  return (
    <div className="bg-abyss-black py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md sm:max-w-lg lg:max-w-xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          {icon && (
            <div className="flex justify-center mb-4">
              {icon}
            </div>
          )}
          <h2 className="text-3xl font-bold bg-gradient-to-r from-void-accent-light via-seductive-light to-void-accent bg-clip-text text-transparent">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-abyss-light-gray">
              {subtitle}
            </p>
          )}
        </div>

        {/* Main Content Card */}
        <div className="card">
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

export default AuthCard;
