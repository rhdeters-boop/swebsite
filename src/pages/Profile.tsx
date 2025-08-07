import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { username } = useParams();

  useEffect(() => {
    // If we're at /profile without a username, redirect to appropriate user profile
    if (!username) {
      if (user?.username) {
        // Authenticated user: redirect to their own profile
        navigate(`/user/${user.username}`, { replace: true });
      } else {
        // Unauthenticated user: redirect to a default profile or creator list
        // You can change this to redirect to a specific creator profile
        navigate('/creators', { replace: true });
      }
    }
  }, [user, navigate, username]);

  // Loading state while redirecting
  return (
    <div className="w-full min-h-screen bg-background-primary flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-void-accent mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading profile...</p>
      </div>
    </div>
  );
};

export default Profile;
