import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingUp, Crown, ChevronLeft, ChevronRight, ArrowRight, Users, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Carousel component with sliding functionality (reused from Explore)
const CreatorCarousel: React.FC<{ 
  title: string; 
  creators: Creator[]; 
  icon: React.ReactNode;
  onSeeMore: () => void;
}> = ({ title, creators, icon, onSeeMore }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate how many items can fit based on container width
  const getItemsPerView = () => {
    if (!containerRef.current) return 1;
    const containerWidth = containerRef.current.offsetWidth;
    const itemWidth = 224; // w-56 = 224px (14rem * 16px)
    const gap = 16; // gap-4 = 16px
    return Math.floor((containerWidth + gap) / (itemWidth + gap)) || 1;
  };

  const [itemsPerView, setItemsPerView] = useState(1);
  const maxIndex = Math.max(0, creators.length - itemsPerView);

  React.useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(getItemsPerView());
    };
    
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + itemsPerView, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - itemsPerView, 0));
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <button
          onClick={onSeeMore}
          className="flex items-center gap-2 text-seductive hover:text-seductive-dark transition-colors duration-200 group"
        >
          <span className="text-sm font-medium">See More</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
      
      <div className="relative">
        {/* Navigation Buttons */}
        {currentIndex > 0 && (
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-200 shadow-lg"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        
        {currentIndex < maxIndex && (
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-200 shadow-lg"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Carousel Container */}
        <div className="overflow-hidden" ref={containerRef}>
          <div 
            className="flex transition-transform duration-300 ease-in-out gap-4"
            style={{ 
              transform: `translateX(-${currentIndex * 240}px)` // 224px width + 16px gap
            }}
          >
            {creators.map((creator) => (
              <div key={creator.id} className="flex-shrink-0">
                <CreatorCard creator={creator} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data for followed creators
const mockFollowedCreators = {
  recent: [
    { id: 1, name: 'Luna Rose', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '12.5K', isOnline: true, subscriptionType: 'premium' as const },
    { id: 3, name: 'Zara Noir', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '15.2K', isOnline: true, subscriptionType: 'basic' as const },
    { id: 6, name: 'Stella Divine', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '18.7K', isOnline: true, subscriptionType: 'premium' as const },
    { id: 9, name: 'Phoenix Fire', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '7.9K', isOnline: true, subscriptionType: 'free' as const },
    { id: 12, name: 'Raven Dark', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '7.9K', isOnline: true, subscriptionType: 'basic' as const },
  ],
  premium: [
    { id: 1, name: 'Luna Rose', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '12.5K', isOnline: true, subscriptionType: 'premium' as const },
    { id: 6, name: 'Stella Divine', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '18.7K', isOnline: true, subscriptionType: 'premium' as const },
    { id: 33, name: 'Valentina Rich', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '12.3K', isOnline: true, subscriptionType: 'premium' as const },
  ],
  free: [
    { id: 9, name: 'Phoenix Fire', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '7.9K', isOnline: true, subscriptionType: 'free' as const },
    { id: 21, name: 'Bella Luxe', image: '/api/placeholder/300/400', rating: 4.4, subscribers: '1.2K', isOnline: true, subscriptionType: 'free' as const },
    { id: 27, name: 'Luna Pearl', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '2.3K', isOnline: true, subscriptionType: 'free' as const },
  ]
};

interface Creator {
  id: number;
  name: string;
  image: string;
  rating: number;
  subscribers: string;
  isOnline: boolean;
  subscriptionType: 'free' | 'basic' | 'premium';
}

interface CreatorRowProps {
  title: string;
  creators: Creator[];
  icon: React.ReactNode;
}

const CreatorCard: React.FC<{ creator: Creator }> = ({ creator }) => {
  const getSubscriptionBadge = () => {
    switch (creator.subscriptionType) {
      case 'premium':
        return <div className="absolute top-3 left-3 bg-yellow-500 text-abyss-black text-xs font-bold px-2 py-1 rounded">PREMIUM</div>;
      case 'basic':
        return <div className="absolute top-3 left-3 bg-seductive text-white text-xs font-bold px-2 py-1 rounded">BASIC</div>;
      case 'free':
        return <div className="absolute top-3 left-3 bg-void-600 text-white text-xs font-bold px-2 py-1 rounded">FREE</div>;
      default:
        return null;
    }
  };

  return (
    <Link 
      to={`/creator/${creator.id}`}
      className="group relative flex-shrink-0 w-56 bg-abyss-black rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 border border-void-500/20 hover:border-seductive/50"
    >
      <div className="relative">
        <div className="w-56 h-72 bg-gradient-to-br from-void-500/20 to-abyss-black flex items-center justify-center">
          <div className="text-6xl text-void-500/40">👤</div>
        </div>
        {getSubscriptionBadge()}
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
};

const CreatorRow: React.FC<CreatorRowProps> = ({ title, creators, icon }) => {
  const handleSeeMore = () => {
    // TODO: Navigate to category page or show more creators
    console.log(`See more ${title}`);
  };

  return (
    <CreatorCarousel
      title={title}
      creators={creators}
      icon={icon}
      onSeeMore={handleSeeMore}
    />
  );
};

const Following: React.FC = () => {
  const { isAuthenticated } = useAuth();

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
              <p className="text-xl text-abyss-light-gray mb-2">
                Create your account to access your personalized feed
              </p>
              <p className="text-abyss-light-gray">
                Follow your favorite creators and never miss their latest content
              </p>
            </div>

            <div className="bg-abyss-dark-900 border border-void-500/30 rounded-2xl p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <Heart className="h-12 w-12 text-seductive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Follow Creators</h3>
                  <p className="text-abyss-light-gray text-sm">Get updates from your favorite content creators</p>
                </div>
                <div className="text-center">
                  <Star className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Premium Content</h3>
                  <p className="text-abyss-light-gray text-sm">Access exclusive photos and videos</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-lust-violet mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Personalized Feed</h3>
                  <p className="text-abyss-light-gray text-sm">Content tailored just for you</p>
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
        <CreatorRow
          title="Recent Activity"
          creators={mockFollowedCreators.recent}
          icon={<TrendingUp className="h-6 w-6 text-seductive" />}
        />
        
        <CreatorRow
          title="Premium Subscriptions"
          creators={mockFollowedCreators.premium}
          icon={<Crown className="h-6 w-6 text-yellow-400" />}
        />
        
        <CreatorRow
          title="Following"
          creators={mockFollowedCreators.free}
          icon={<Users className="h-6 w-6 text-void-600" />}
        />
      </div>
    </div>
  );
};

export default Following;
