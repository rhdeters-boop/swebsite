import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  BarChart3, 
  DollarSign, 
  FileImage, 
  MessageSquare, 
  Settings, 
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react';
import axios from 'axios';
import CreatorProfile from '../components/creator-dashboard/CreatorProfile';

interface Creator {
  id: number;
  userId: number;
  displayName: string;
  profileImage?: string;
  subscriptionPrice: number;
  subscriberCount?: number;
  likeCount?: number;
  bio?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    onlyFans?: string;
    youtube?: string;
    website?: string;
  };
}

type TabType = 'overview' | 'profile' | 'content' | 'analytics' | 'earnings' | 'messages' | 'subscribers' | 'settings';

const CreatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Fetch creator data and verify user is a creator
  useEffect(() => {
    const fetchCreatorData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const response = await axios.get(`/creators/user/${user.id}`);
        setCreator(response.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          // User is not a creator, redirect to regular profile
          navigate('/profile', { replace: true });
          return;
        }
        setError('Failed to load creator data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreatorData();
  }, [user, navigate]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'content', label: 'Content', icon: FileImage },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'subscribers', label: 'Subscribers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!user || isLoading) {
    return (
      <div className="bg-background-primary flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-void-accent mx-auto mb-4"></div>
          <p className="text-text-muted">Loading creator dashboard...</p>
        </div>
      </div>
    );
  }

  if (!creator && !isLoading) {
    return null; // Will redirect to /profile
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <CreatorProfile user={user} creator={creator} />;
      
      case 'overview':
        return <DashboardOverview creator={creator} />;
      
      case 'content':
        return <ContentManagement creator={creator} />;
      
      case 'analytics':
        return <Analytics creator={creator} />;
      
      case 'earnings':
        return <Earnings creator={creator} />;
      
      case 'messages':
        return <Messages creator={creator} />;
      
      case 'subscribers':
        return <Subscribers creator={creator} />;
      
      case 'settings':
        return <CreatorSettings creator={creator} />;
      
      default:
        return <DashboardOverview creator={creator} />;
    }
  };

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <div className="bg-background-card border-b border-border-secondary">
        <div className="container-content">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-background-secondary rounded-full flex items-center justify-center">
                {creator?.profileImage || user?.profilePicture ? (
                  <img
                    src={creator?.profileImage || user?.profilePicture}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-text-muted" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-text-primary">
                  {creator?.displayName || 'Creator Dashboard'}
                </h1>
                <p className="text-text-muted">@{user?.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-text-muted">Monthly Rate</p>
                <p className="font-semibold text-void-accent">
                  ${((creator?.subscriptionPrice || 0) / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-content">
        <div className="flex flex-col lg:flex-row gap-6 py-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="card-elevated p-4">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-void-accent/10 text-void-accent border border-void-accent/20'
                          : 'text-text-secondary hover:bg-background-secondary/50 hover:text-text-primary'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="alert-error mb-6">
                {error}
              </div>
            )}
            
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview: React.FC<{ creator: Creator | null }> = ({ creator }) => {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Total Subscribers</p>
              <p className="text-2xl font-bold text-text-primary">{creator?.subscriberCount || 0}</p>
            </div>
            <Users className="h-8 w-8 text-void-accent" />
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Monthly Revenue</p>
              <p className="text-2xl font-bold text-success">
                ${((creator?.subscriberCount || 0) * (creator?.subscriptionPrice || 0) / 100).toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-success" />
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Total Likes</p>
              <p className="text-2xl font-bold text-text-primary">{creator?.likeCount || 0}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-lust-violet" />
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm">Content Items</p>
              <p className="text-2xl font-bold text-text-primary">0</p>
            </div>
            <FileImage className="h-8 w-8 text-seductive" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">No recent activity</p>
            <p className="text-text-muted text-sm">Start by uploading your first content!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other tabs
const ContentManagement: React.FC<{ creator: Creator | null }> = () => (
  <div className="card-elevated p-6">
    <h2 className="text-lg font-semibold text-text-primary mb-4">Content Management</h2>
    <p className="text-text-muted">Content management functionality coming soon...</p>
  </div>
);

const Analytics: React.FC<{ creator: Creator | null }> = () => (
  <div className="card-elevated p-6">
    <h2 className="text-lg font-semibold text-text-primary mb-4">Analytics</h2>
    <p className="text-text-muted">Analytics dashboard coming soon...</p>
  </div>
);

const Earnings: React.FC<{ creator: Creator | null }> = () => (
  <div className="card-elevated p-6">
    <h2 className="text-lg font-semibold text-text-primary mb-4">Earnings</h2>
    <p className="text-text-muted">Earnings overview coming soon...</p>
  </div>
);

const Messages: React.FC<{ creator: Creator | null }> = () => (
  <div className="card-elevated p-6">
    <h2 className="text-lg font-semibold text-text-primary mb-4">Messages</h2>
    <p className="text-text-muted">Messaging system coming soon...</p>
  </div>
);

const Subscribers: React.FC<{ creator: Creator | null }> = () => (
  <div className="card-elevated p-6">
    <h2 className="text-lg font-semibold text-text-primary mb-4">Subscribers</h2>
    <p className="text-text-muted">Subscriber management coming soon...</p>
  </div>
);

const CreatorSettings: React.FC<{ creator: Creator | null }> = () => (
  <div className="card-elevated p-6">
    <h2 className="text-lg font-semibold text-text-primary mb-4">Settings</h2>
    <p className="text-text-muted">Creator settings coming soon...</p>
  </div>
);

export default CreatorDashboard;
