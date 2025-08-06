import React, { useState, useEffect } from 'react';
import { Heart, HeartOff } from 'lucide-react';

interface CreatorLikeButtonProps {
  creatorId: string; // Changed from number to string for UUID
  onLikeChange?: (liked: boolean, newLikeCount: number) => void;
  className?: string;
}

interface LikeData {
  likes: number;
  dislikes: number;
  total: number;
  userVote: boolean | null; // null = no vote, true = like, false = dislike
}

const CreatorLikeButton: React.FC<CreatorLikeButtonProps> = ({
  creatorId,
  onLikeChange,
  className = '',
}) => {
  const [likeData, setLikeData] = useState<LikeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const fetchLikeData = async () => {
    // Validate creatorId before making API call
    if (!creatorId || creatorId === 'undefined' || creatorId === 'null' || creatorId.includes('NaN')) {
      console.warn('Invalid creatorId provided to CreatorLikeButton:', creatorId);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/likes/${creatorId}/likes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (response.ok) {
        const result = await response.json();
        setLikeData(result.data);
      } else {
        console.error('Failed to fetch like data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching like data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (isLike: boolean) => {
    if (submitting || !likeData) return;

    // Validate creatorId before making API call
    if (!creatorId || creatorId === 'undefined' || creatorId === 'null' || creatorId.includes('NaN')) {
      console.warn('Invalid creatorId provided to handleVote:', creatorId);
      alert('Invalid creator ID. Cannot process vote.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login or show auth modal
      alert('Please log in to like creators');
      return;
    }

    setSubmitting(true);
    try {
      let response;
      
      if (likeData.userVote === isLike) {
        // Remove vote if clicking the same button
        response = await fetch(`http://localhost:5001/api/likes/${creatorId}/like`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // Set new vote
        response = await fetch(`http://localhost:5001/api/likes/${creatorId}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isLike }),
        });
      }

      if (response.ok) {
        const result = await response.json();
        setLikeData(result.data);
        
        if (onLikeChange) {
          onLikeChange(result.data.userVote === true, result.data.likes);
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update vote');
      }
    } catch (error) {
      console.error('Error updating vote:', error);
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchLikeData();
  }, [creatorId]);

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse bg-gray-600 h-8 w-16 rounded"></div>
      </div>
    );
  }

  if (!likeData) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Like Button */}
      <button
        onClick={() => handleVote(true)}
        disabled={submitting}
        className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
          likeData.userVote === true
            ? 'bg-red-600 text-white shadow-lg'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
        } ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
      >
        <Heart
          className={`h-5 w-5 ${
            likeData.userVote === true ? 'fill-current' : ''
          }`}
        />
        <span className="font-medium">{formatNumber(likeData.likes)}</span>
      </button>

      {/* Dislike Button */}
      <button
        onClick={() => handleVote(false)}
        disabled={submitting}
        className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
          likeData.userVote === false
            ? 'bg-gray-600 text-white shadow-lg'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
        } ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
      >
        <HeartOff
          className={`h-5 w-5 ${
            likeData.userVote === false ? 'fill-current' : ''
          }`}
        />
        <span className="text-sm text-gray-400">
          {likeData.userVote === false ? 'Disliked' : 'Dislike'}
        </span>
      </button>
    </div>
  );
};

export default CreatorLikeButton;
