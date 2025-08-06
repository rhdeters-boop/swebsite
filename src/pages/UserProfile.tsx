import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  MapPin, 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreVertical,
  Shield,
  Flag,
  UserPlus,
  UserMinus
} from 'lucide-react';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [isFollowing, setIsFollowing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Mock user data - replace with actual API call
  const user = {
    id: userId,
    username: "sophia_dream",
    displayName: "Sophia Dreams",
    avatar: "/api/placeholder/120/120",
    coverImage: "/api/placeholder/800/300",
    bio: "Artist, dreamer, and void wanderer ✨ Creating beauty in the darkness 🌙",
    location: "Los Angeles, CA",
    joinDate: "March 2024",
    isVerified: true,
    stats: {
      following: 234,
      followers: 1823,
      likes: 4567,
      posts: 89
    },
    badges: [
      { name: "Early Adopter", icon: "🚀", color: "text-blue-400" },
      { name: "Active User", icon: "⚡", color: "text-yellow-400" },
      { name: "Community Star", icon: "⭐", color: "text-purple-400" }
    ]
  };

  const recentActivity = [
    {
      id: 1,
      type: "like",
      action: "liked a post by @midnight_rose",
      timestamp: "2 hours ago",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 2,
      type: "comment",
      action: "commented on @void_queen's post",
      content: "Absolutely stunning! 😍",
      timestamp: "5 hours ago",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 3,
      type: "follow",
      action: "started following @dark_aesthetic",
      timestamp: "1 day ago",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 4,
      type: "post",
      action: "shared a new thought",
      content: "Lost in the void, but finding myself... 🌌",
      timestamp: "2 days ago",
      avatar: "/api/placeholder/40/40"
    }
  ];

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-400" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-400" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-400" />;
      case 'post':
        return <MessageCircle className="h-4 w-4 text-seductive" />;
      default:
        return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-abyss-black min-h-screen">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-lust-violet/30 to-seductive/30">
        <img
          src={user.coverImage}
          alt="Cover"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-abyss-black/60 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative -mt-16 md:-mt-20">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-abyss-black bg-abyss-dark-900"
              />
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-seductive rounded-full p-1">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 mt-4 md:mt-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {user.displayName}
                  </h1>
                  <p className="text-abyss-light-gray">@{user.username}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      isFollowing
                        ? 'bg-abyss-dark-800 border border-void-500/30 text-white hover:bg-abyss-dark-700'
                        : 'bg-gradient-to-r from-lust-violet to-seductive text-white hover:shadow-glow-primary transform hover:scale-[1.02]'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2 inline" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2 inline" />
                        Follow
                      </>
                    )}
                  </button>

                  <button className="p-2 bg-abyss-dark-800 border border-void-500/30 rounded-lg text-abyss-light-gray hover:text-white hover:border-seductive/50 transition-colors duration-200">
                    <MessageCircle className="h-5 w-5" />
                  </button>

                  <button className="p-2 bg-abyss-dark-800 border border-void-500/30 rounded-lg text-abyss-light-gray hover:text-white hover:border-seductive/50 transition-colors duration-200">
                    <Share2 className="h-5 w-5" />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="p-2 bg-abyss-dark-800 border border-void-500/30 rounded-lg text-abyss-light-gray hover:text-white hover:border-seductive/50 transition-colors duration-200"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-abyss-dark-800 border border-void-500/30 rounded-lg shadow-lg z-10">
                        <button className="w-full px-4 py-2 text-left text-abyss-light-gray hover:text-white hover:bg-abyss-dark-700 rounded-t-lg transition-colors duration-200">
                          <Flag className="h-4 w-4 mr-2 inline" />
                          Report User
                        </button>
                        <button className="w-full px-4 py-2 text-left text-abyss-light-gray hover:text-white hover:bg-abyss-dark-700 rounded-b-lg transition-colors duration-200">
                          <Shield className="h-4 w-4 mr-2 inline" />
                          Block User
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio and Details */}
          <div className="mt-6">
            <p className="text-abyss-light-gray mb-4">{user.bio}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-abyss-light-gray">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {user.location}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Joined {user.joinDate}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {user.badges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center px-3 py-1 bg-abyss-dark-800 border border-void-500/30 rounded-full text-sm"
                >
                  <span className="mr-1">{badge.icon}</span>
                  <span className={badge.color}>{badge.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-abyss-dark-900 border border-void-500/30 rounded-xl">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{user.stats.posts}</div>
              <div className="text-sm text-abyss-light-gray">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{user.stats.followers}</div>
              <div className="text-sm text-abyss-light-gray">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{user.stats.following}</div>
              <div className="text-sm text-abyss-light-gray">Following</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{user.stats.likes}</div>
              <div className="text-sm text-abyss-light-gray">Likes</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-4 hover:border-seductive/30 transition-colors duration-200"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-abyss-light-gray text-sm">
                      {activity.action}
                    </p>
                    {activity.content && (
                      <p className="text-white mt-1">{activity.content}</p>
                    )}
                    <p className="text-xs text-abyss-light-gray mt-2">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-6">
            <button className="px-6 py-2 bg-abyss-dark-800 border border-void-500/30 text-abyss-light-gray rounded-lg hover:text-white hover:border-seductive/50 transition-colors duration-200">
              Load More Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
