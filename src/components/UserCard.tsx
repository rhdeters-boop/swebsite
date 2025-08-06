import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Star, MapPin } from 'lucide-react';

interface User {
  id: string | number;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  followerCount: number;
  likes: number;
  totalViews?: number;
  location?: string;
  isVerified?: boolean;
  badges?: string[];
}

interface UserCardProps {
  user: User;
  showStats?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, showStats = true }) => {
  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <Link 
      to={`/user/${user.id}`}
      className="group relative flex-shrink-0 w-56 bg-abyss-black rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 border border-void-500/20 hover:border-seductive/50"
    >
      <div className="relative">
        <div className="w-56 h-72 bg-gradient-to-br from-void-500/20 to-abyss-black flex items-center justify-center">
          {user.avatar && user.avatar !== '/placeholder-avatar.jpg' ? (
            <img 
              src={user.avatar} 
              alt={user.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl text-void-500/40">👤</div>
          )}
        </div>
        
        {/* Online Status */}
        {user.isOnline && (
          <div className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full border-2 border-abyss-black"></div>
        )}
        
        {/* Verified Badge */}
        {user.isVerified && (
          <div className="absolute top-3 left-3 bg-seductive/90 px-2 py-1 rounded-full flex items-center space-x-1">
            <Star className="h-3 w-3 text-white" />
            <span className="text-white text-xs font-semibold">VERIFIED</span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Quick Stats Overlay */}
        {showStats && (
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{user.totalViews ? formatCount(user.totalViews) : '0'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-3 w-3 text-red-400" />
                  <span>{formatCount(user.likes)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-semibold truncate flex-1">{user.displayName}</h3>
          {user.isVerified && (
            <Star className="h-4 w-4 text-seductive flex-shrink-0 ml-2" />
          )}
        </div>
        
        <p className="text-abyss-light-gray text-sm truncate mb-2">@{user.username}</p>
        
        {user.location && (
          <div className="flex items-center text-xs text-abyss-light-gray mb-2">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate">{user.location}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Heart className="h-4 w-4 text-red-400 fill-current" />
            <span className="text-abyss-light-gray text-sm">{formatCount(user.likes)}</span>
          </div>
          <span className="text-seductive text-sm">{formatCount(user.followerCount)} followers</span>
        </div>
        
        {/* User Badges */}
        {user.badges && user.badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {user.badges.slice(0, 2).map((badge, index) => (
              <span
                key={index}
                className="text-xs bg-seductive/20 text-seductive px-2 py-1 rounded-full"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default UserCard;
export type { User, UserCardProps };
