import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Crown, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFollowedCreators } from '../hooks/useSubscriptions';
import CreatorRow from '../components/CreatorRow';

const MyFeed: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Only fetch subscriptions if authenticated
  const { recent, premium, free, basic, loading, error } = useFollowedCreators(isAuthenticated);

  // Handle tab navigation
  const handleTabChange = (tab: 'explore' | 'feed') => {
    if (tab === 'explore') {
      navigate('/');
    }
    // If tab === 'feed', we're already on this page
  };

  // Show login form for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="bg-abyss-black min-h-screen">
        {/* Tab Navigation */}
        <div className="border-b border-void-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => { handleTabChange('explore'); }}
                className="py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 border-transparent text-abyss-light-gray hover:text-white hover:border-void-500"
              >
                Explore
              </button>
              <button
                onClick={() => { handleTabChange('feed'); }}
                className="py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 border-seductive text-seductive"
              >
                My Feed
              </button>
            </nav>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-void-accent-light via-seductive-light to-void-accent bg-clip-text text-transparent">
            Personalize your <span className="text-5xl text-lust-violet text-shadow-void-glow">Void</span>
            </h2>
            <h1 className="text-4xl font-bold text-white mb-4 font-serif">
              
            </h1>
            <p className="text-abyss-light-gray text-lg leading-relaxed">
              Sign in or Create an Account now to start getting your personalized feed.
              <br></br>Follow your favorite creators and never miss exclusive content.
            </p>
          </div>

          <div className="bg-gradient-to-br from-abyss-dark to-abyss-darker rounded-3xl p-8 shadow-glow mb-8">
            {/* Action Buttons */}
            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login"
                  className="flex-1 bg-gradient-to-r from-void-accent to-seductive text-white font-semibold py-3 px-6 rounded-lg hover:from-void-accent-light hover:to-seductive-light transition-all duration-300 text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 bg-transparent border-2 border-void-accent text-void-accent hover:bg-void-accent hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 text-center"
                >
                  Register Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-abyss-black min-h-screen">
      {/* Tab Navigation */}
      <div className="border-b border-void-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => { handleTabChange('explore'); }}
              className="py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 border-transparent text-abyss-light-gray hover:text-white hover:border-void-500"
            >
              Explore
            </button>
            <button
              onClick={() => { handleTabChange('feed'); }}
              className="py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 border-seductive text-seductive"
            >
              My Feed
            </button>
          </nav>
        </div>
      </div>

      {/* Creator Rows */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-white">Loading your subscriptions...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-400">{error}</div>
          </div>
        ) : (
          <>
            <CreatorRow
              title="Recent Activity"
              creators={recent}
              icon={<TrendingUp className="h-6 w-6 text-seductive" />}
            />
            
            <CreatorRow
              title="Premium Subscriptions"
              creators={premium}
              icon={<Crown className="h-6 w-6 text-yellow-400" />}
            />
            
            <CreatorRow
              title="Following"
              creators={[...free, ...basic]}
              icon={<Users className="h-6 w-6 text-void-600" />}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MyFeed;
