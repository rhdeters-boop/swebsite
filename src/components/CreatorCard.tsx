import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { Creator } from './CreatorCarousel';

const CreatorCard: React.FC<{ creator: Creator }> = ({ creator }) => (
  <Link 
    to={`/creator/${creator.id}`}
    className="group relative flex-shrink-0 w-56 bg-abyss-black rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 border border-void-500/20 hover:border-seductive/50"
  >
    <div className="relative">
      <div className="w-56 h-72 bg-gradient-to-br from-void-500/20 to-abyss-black flex items-center justify-center">
        <div className="text-6xl text-void-500/40">👤</div>
      </div>
      {creator.isOnline && (
        <div className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full border-2 border-abyss-black"></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
    
    <div className="p-4">
      <h3 className="text-white font-semibold truncate">{creator.name}</h3>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-abyss-light-gray text-sm">{creator.rating}</span>
        </div>
        <span className="text-seductive text-sm">{creator.subscribers}</span>
      </div>
    </div>
  </Link>
);

export default CreatorCard;
