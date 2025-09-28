import React from 'react';
import { TrendingUp, Sparkles, Crown, Users } from 'lucide-react';
import CreatorRow from '../CreatorRow';
import { useCreators } from '../../hooks/useCreators';
import { useScrollMaintenance } from '../../hooks/useScrollRestoration';

const Explore: React.FC = () => {
  const { topCreators, trendingCreators, newCreators, loading, error } = useCreators();
  
  // Maintain scroll position when returning to this page
  useScrollMaintenance();

  if (loading) {
    return (
      <div className="bg-abyss-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-seductive mx-auto mb-4"></div>
          <p className="text-abyss-light-gray">Loading creators...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-abyss-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => { window.location.reload(); }}
            className="bg-seductive hover:bg-seductive-dark text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-abyss-black ">
      {/* Tab Content - Only show explore content since feed redirects */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CreatorRow
          title="Top Performers"
          creators={topCreators}
          icon={<Crown className="h-6 w-6 text-yellow-400" />}
        />
        
        <CreatorRow
          title="Trending Now"
          creators={trendingCreators}
          icon={<TrendingUp className="h-6 w-6 text-seductive" />}
        />
        
        <CreatorRow
          title="Featured Creators"
          creators={topCreators.slice(0, 6)}
          icon={<Users className="h-6 w-6 text-seductive" />}
        />
        
        <CreatorRow
          title="New & Rising"
          creators={newCreators}
          icon={<Sparkles className="h-6 w-6 text-seductive" />}
        />
      </div>
    </div>
  );
};

export default Explore;
