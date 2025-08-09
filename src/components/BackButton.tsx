import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRouteHistory } from '../context/RouteHistoryContext'

interface BackButtonProps {
  fallbackPath?: string;
  overrideRoutes?: Record<string, string>;
  className?: string;
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  fallbackPath = '/',
  overrideRoutes = { '/login': '/', '/register': '/login' },
  className,
  label = 'Back',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { previous, replaceTop, pop } = useRouteHistory();

  const handleBack = () => {
    const currentPath = location.pathname + location.search + location.hash;

    // Route-specific override
    const override = overrideRoutes[location.pathname];
    if (override) {
      replaceTop(override);
      navigate(override, { replace: true });
      return;
    }

    if (previous && previous !== currentPath) {
      pop(); // drop current
      navigate(previous, { replace: true }); // replace to avoid stacking
      return;
    }

    // No previous distinct entry -> go to fallback
    replaceTop(fallbackPath);
    navigate(fallbackPath, { replace: true });
  };

  return (
    <div className={`absolute top-6 left-6 md:top-8 md:left-8 lg:top-10 lg:left-10 z-10 ${className ?? ''}`}>
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 lg:px-5 lg:py-3 text-gray-400 hover:text-white transition-colors duration-200 group"
        aria-label={label}
        title={label}
      >
        <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="text-sm md:text-base lg:text-lg font-medium">{label}</span>
      </button>
    </div>
  );
};

export default BackButton;