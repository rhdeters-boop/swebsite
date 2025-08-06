import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Crown, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFollowedCreators } from '../hooks/useSubscriptions';
import CreatorRow from '../components/CreatorRow';

const Following: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { recent, premium, free, basic, loading, error } = useFollowedCreators();

  // Show call-to-action for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="bg-abyss-black h-screen overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-full pt-[5%] pb-[5%]">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4 font-serif">
                Join the <span className="text-gradient">Void</span>
              </h1>
              <p className="text-abyss-light-gray text-lg leading-relaxed">
                Connect with your favorite creators and never miss an update. 
                Get exclusive content, behind-the-scenes access, and direct interaction.
              </p>
            </div>

            <div className="bg-gradient-to-br from-abyss-dark to-abyss-darker rounded-3xl p-8 shadow-glow mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-lust-violet to-seductive rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Follow Creators</h3>
                  <p className="text-abyss-light-gray text-sm">
                    Stay updated with your favorite content creators and models
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-lust-violet to-seductive rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Premium Content</h3>
                  <p className="text-abyss-light-gray text-sm">
                    Access exclusive photos, videos, and premium experiences
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-lust-violet to-seductive rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Live Updates</h3>
                  <p className="text-abyss-light-gray text-sm">
                    Get real-time notifications and activity from your followed creators
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-lust-violet to-seductive text-white px-8 py-3 rounded-lg font-semibold hover:shadow-glow-primary transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Login/Register
                </Link>
                <Link
                  to="/become-creator"
                  className="bg-transparent border-2 border-seductive text-seductive hover:bg-seductive hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  Become a Creator
                </Link>
              </div>
            </div>

            <div className="text-abyss-light-gray">
              <p className="text-sm">
                Already have an account? <Link to="/login" className="text-seductive hover:text-seductive-light">Sign in here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-abyss-black min-h-screen">
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

export default Following;
