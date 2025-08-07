import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to unified profile system
  useEffect(() => {
    if (user?.username) {
      navigate(`/user/${user.username}`, { replace: true });
    } else if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Loading state while redirecting
  return (
    <div className="w-full min-h-screen bg-background-primary flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-void-accent mx-auto mb-4"></div>
        <p className="text-text-secondary">Redirecting to your profile...</p>
      </div>
    </div>
  );
};

export default Profile;
