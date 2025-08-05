import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, CreditCard, Settings, Star, Heart } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="bg-void-dark-950 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-void-accent-light via-seductive-light to-void-accent bg-clip-text text-transparent">
            Welcome to the <span className="text-lust-violet text-shadow-void-glow">Void</span>, {(user as any)?.displayName || 'Creator'}!
          </h1>
          <p className="text-gray-300 mt-2">Manage your premium content and subscriptions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-void-dark-900 border border-void-500/30 rounded-xl p-6 text-center hover:border-void-accent/50 transition-colors duration-200">
            <User className="h-12 w-12 text-void-accent mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">Profile Settings</h3>
            <p className="text-gray-400 text-sm mb-4">Update your creator profile and bio</p>
            <Link 
              to="/profile" 
              className="bg-void-accent hover:bg-void-accent-light text-white w-full py-2 rounded-lg block transition-colors duration-200"
            >
              Manage Profile
            </Link>
          </div>

          <div className="bg-void-dark-900 border border-void-500/30 rounded-xl p-6 text-center hover:border-seductive/50 transition-colors duration-200">
            <Star className="h-12 w-12 text-seductive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">Subscription Tiers</h3>
            <p className="text-gray-400 text-sm mb-4">Manage your subscription offerings</p>
            <Link 
              to="/subscription-tiers" 
              className="bg-seductive hover:bg-seductive-light text-white w-full py-2 rounded-lg block transition-colors duration-200"
            >
              View Tiers
            </Link>
          </div>

          <div className="bg-void-dark-900 border border-void-500/30 rounded-xl p-6 text-center hover:border-lust-violet/50 transition-colors duration-200">
            <Heart className="h-12 w-12 text-lust-violet mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">Content Gallery</h3>
            <p className="text-gray-400 text-sm mb-4">Upload and manage your premium media</p>
            <Link 
              to="/media-gallery" 
              className="bg-lust-violet hover:bg-lust-violet/80 text-white w-full py-2 rounded-lg block transition-colors duration-200"
            >
              Manage Content
            </Link>
          </div>

          <div className="bg-void-dark-900 border border-void-500/30 rounded-xl p-6 text-center hover:border-void-accent/50 transition-colors duration-200">
            <CreditCard className="h-12 w-12 text-void-accent mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">Earnings</h3>
            <p className="text-gray-400 text-sm mb-4">View your subscription revenue</p>
            <button className="bg-void-accent hover:bg-void-accent-light text-white w-full py-2 rounded-lg transition-colors duration-200">
              View Earnings
            </button>
          </div>

          <div className="bg-void-dark-900 border border-void-500/30 rounded-xl p-6 text-center hover:border-void-accent/50 transition-colors duration-200">
            <Settings className="h-12 w-12 text-void-accent mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">Account Settings</h3>
            <p className="text-gray-400 text-sm mb-4">Security and privacy settings</p>
            <Link 
              to="/account-settings" 
              className="bg-void-accent hover:bg-void-accent-light text-white w-full py-2 rounded-lg block transition-colors duration-200"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
