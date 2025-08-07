import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BackButton from '../components/BackButton';
import ViewerProfile from '../components/profile/ViewerProfile';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is a creator and redirect to creator dashboard
  useEffect(() => {
    const checkUserType = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Try to fetch creator data for this user
        const response = await axios.get(`/creators/user/${user.id}`);
        if (response.data) {
          // User is a creator, redirect to creator dashboard
          navigate('/creator-dashboard', { replace: true });
          return;
        }
      } catch (err: any) {
        // If user is not a creator (404), that's fine - they'll see the viewer profile
        if (err.response?.status !== 404) {
          setError('Failed to load profile data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkUserType();
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="bg-background-primary flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-void-accent mx-auto mb-4"></div>
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-background-primary flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-void-accent mx-auto mb-4"></div>
          <p className="text-text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <BackButton />
      
      <div className="page-section">
        <div className="container-content">
          {error && (
            <div className="alert-error mb-6">
              {error}
            </div>
          )}
          
          <ViewerProfile user={user} />
        </div>
      </div>
    </>
  );
};

export default Profile;
