import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, TrendingUp, Eye } from 'lucide-react';

interface FrontendCreator {
  id: number;
  name: string;
  image: string;
  likes: number;
  subscribers: string;
  isOnline: boolean;
  totalViews?: number;
  weeklyEngagement?: number;
}

const CreatorCard: React.FC<{ creator: FrontendCreator }> = ({ creator }) => {
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const isTrending = creator.weeklyEngagement && creator.weeklyEngagement > 100;

  return (
    <Link 
      to={`/creator/${creator.id}`}
      className="group relative flex-shrink-0 w-56 bg-abyss-black rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 border border-void-500/20 hover:border-seductive/50"
    >
      <div className="relative">
        <div className="w-56 h-72 bg-gradient-to-br from-void-500/20 to-abyss-black flex items-center justify-center">
          {creator.image && creator.image !== '/placeholder-avatar.jpg' ? (
            <img 
              src={creator.image} 
              alt={creator.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl text-void-500/40">👤</div>
          )}
        </div>
        
        {creator.isOnline && (
          <div className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full border-2 border-abyss-black"></div>
        )}
        
        {isTrending && (
          <div className="absolute top-3 left-3 bg-seductive/90 px-2 py-1 rounded-full flex items-center space-x-1">
            <TrendingUp className="h-3 w-3 text-white" />
            <span className="text-white text-xs font-semibold">TRENDING</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-4">
        <h3 className="text-white font-semibold truncate">{creator.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-1">
            <Heart className="h-4 w-4 text-red-400 fill-current" />
            <span className="text-abyss-light-gray text-sm">{formatViews(creator.likes)}</span>
          </div>
          <span className="text-seductive text-sm">{creator.subscribers}</span>
        </div>
        
        {creator.totalViews !== undefined && (
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3 text-void-500" />
              <span className="text-abyss-light-gray text-xs">{formatViews(creator.totalViews)} views</span>
            </div>
            {creator.weeklyEngagement !== undefined && (
              <span className="text-seductive text-xs">{formatViews(creator.weeklyEngagement)} weekly</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default CreatorCard;
