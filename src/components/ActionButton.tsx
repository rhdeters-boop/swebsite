import React from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  to: string;
  variant?: 'primary' | 'secondary';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  rightIcon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  to,
  variant = 'primary',
  icon: Icon,
  iconPosition = 'left',
  rightIcon: RightIcon,
  children,
  className = ''
}) => {
  const baseClasses = "text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 inline-flex items-center hover:opacity-90";
  
  const variantClasses = {
    primary: "bg-lust-violet shadow-glow-primary",
    secondary: "bg-abyss-dark-gray shadow-glow-secondary"
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <Link to={to} className={combinedClasses}>
      {Icon && iconPosition === 'left' && <Icon className="h-5 w-5 mr-2" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="h-5 w-5 ml-2" />}
      {RightIcon && <RightIcon className="h-5 w-5 ml-2" />}
    </Link>
  );
};

export default ActionButton;
