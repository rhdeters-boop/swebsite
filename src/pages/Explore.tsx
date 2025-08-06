import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, Sparkles, Crown } from 'lucide-react';
import Following from './Following';
import CreatorRow from '../components/CreatorRow';
import { useCreators } from '../hooks/useCreators';

const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'explore' | 'feed'>('explore');
  const { topCreators, trendingCreators, newCreators, loading, error } = useCreators();

  // Initialize tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'feed' || tab === 'explore') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab: 'explore' | 'feed') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

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
            onClick={() => window.location.reload()}
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
      {/* Tab Navigation */}
      <div className="border-b border-void-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => handleTabChange('explore')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'explore'
                  ? 'border-seductive text-seductive'
                  : 'border-transparent text-abyss-light-gray hover:text-white hover:border-void-500'
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => handleTabChange('feed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'feed'
                  ? 'border-seductive text-seductive'
                  : 'border-transparent text-abyss-light-gray hover:text-white hover:border-void-500'
              }`}
            >
              My Feed
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'explore' ? (
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
            title="New & Rising"
            creators={newCreators}
            icon={<Sparkles className="h-6 w-6 text-seductive" />}
          />
        </div>
      ) : (
        <Following />
      )}
    </div>
  );
};

export default Explore;
