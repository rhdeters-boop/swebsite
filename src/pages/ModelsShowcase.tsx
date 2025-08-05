import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';


// Carousel component with sliding functionality
const CreatorCarousel: React.FC<{ 
  title: string; 
  creators: typeof mockCreators.top; 
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
import { Star, Heart, TrendingUp, Sparkles, Crown, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

// Mock data - 10 creators per category
const mockCreators = {
  top: [
    { id: 1, name: 'Luna Rose', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '12.5K', isOnline: true },
    { id: 2, name: 'Aria Moon', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '8.3K', isOnline: false },
    { id: 3, name: 'Zara Noir', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '15.2K', isOnline: true },
    { id: 4, name: 'Ivy Sterling', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '6.8K', isOnline: true },
    { id: 5, name: 'Nova Blake', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '11.1K', isOnline: false },
    { id: 6, name: 'Stella Divine', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '18.7K', isOnline: true },
    { id: 7, name: 'Aurora Night', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '9.2K', isOnline: true },
    { id: 8, name: 'Crystal Moon', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '13.5K', isOnline: false },
    { id: 9, name: 'Phoenix Fire', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '7.9K', isOnline: true },
    { id: 10, name: 'Raven Star', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '16.3K', isOnline: true },
  ],
  trending: [
    { id: 11, name: 'Chloe Vixen', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '4.2K', isOnline: true },
    { id: 12, name: 'Raven Dark', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '7.9K', isOnline: true },
    { id: 13, name: 'Scarlett Fire', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '9.5K', isOnline: false },
    { id: 14, name: 'Jade Venus', image: '/api/placeholder/300/400', rating: 4.5, subscribers: '3.7K', isOnline: true },
    { id: 15, name: 'Ruby Storm', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '13.8K', isOnline: true },
    { id: 16, name: 'Amber Wild', image: '/api/placeholder/300/400', rating: 4.4, subscribers: '5.1K', isOnline: false },
    { id: 17, name: 'Diamond Rush', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '8.6K', isOnline: true },
    { id: 18, name: 'Emerald Grace', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '6.4K', isOnline: true },
    { id: 19, name: 'Sapphire Blue', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '10.2K', isOnline: false },
    { id: 20, name: 'Violet Dreams', image: '/api/placeholder/300/400', rating: 4.5, subscribers: '4.8K', isOnline: true },
  ],
  new: [
    { id: 21, name: 'Bella Luxe', image: '/api/placeholder/300/400', rating: 4.4, subscribers: '1.2K', isOnline: true },
    { id: 22, name: 'Mia Dreams', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '2.8K', isOnline: false },
    { id: 23, name: 'Lexi Wild', image: '/api/placeholder/300/400', rating: 4.3, subscribers: '0.9K', isOnline: true },
    { id: 24, name: 'Tessa Gold', image: '/api/placeholder/300/400', rating: 4.5, subscribers: '1.8K', isOnline: true },
    { id: 25, name: 'Maya Silk', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '3.1K', isOnline: false },
    { id: 26, name: 'Coco Bliss', image: '/api/placeholder/300/400', rating: 4.2, subscribers: '0.7K', isOnline: true },
    { id: 27, name: 'Luna Pearl', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '2.3K', isOnline: true },
    { id: 28, name: 'Rose Velvet', image: '/api/placeholder/300/400', rating: 4.4, subscribers: '1.5K', isOnline: false },
    { id: 29, name: 'Sky Angel', image: '/api/placeholder/300/400', rating: 4.3, subscribers: '1.1K', isOnline: true },
    { id: 30, name: 'Star Bright', image: '/api/placeholder/300/400', rating: 4.5, subscribers: '2.0K', isOnline: true },
  ],
  brunette: [
    { id: 31, name: 'Sophia Dark', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '8.7K', isOnline: true },
    { id: 32, name: 'Isabella Night', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '5.4K', isOnline: false },
    { id: 33, name: 'Valentina Rich', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '12.3K', isOnline: true },
    { id: 34, name: 'Carmen Storm', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '7.1K', isOnline: true },
    { id: 35, name: 'Lucia Fire', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '9.8K', isOnline: false },
    { id: 36, name: 'Bianca Moon', image: '/api/placeholder/300/400', rating: 4.5, subscribers: '4.9K', isOnline: true },
    { id: 37, name: 'Adriana Deep', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '6.7K', isOnline: true },
    { id: 38, name: 'Camila Rich', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '5.8K', isOnline: false },
    { id: 39, name: 'Elena Dark', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '8.2K', isOnline: true },
    { id: 40, name: 'Natasha Night', image: '/api/placeholder/300/400', rating: 4.9, subscribers: '11.4K', isOnline: true },
  ],
  blonde: [
    { id: 41, name: 'Emma Bright', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '7.2K', isOnline: true },
    { id: 42, name: 'Chloe Sun', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '9.8K', isOnline: false },
    { id: 43, name: 'Ashley Light', image: '/api/placeholder/300/400', rating: 4.5, subscribers: '4.6K', isOnline: true },
    { id: 44, name: 'Madison Gold', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '6.3K', isOnline: true },
    { id: 45, name: 'Samantha Shine', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '8.1K', isOnline: false },
    { id: 46, name: 'Taylor Glow', image: '/api/placeholder/300/400', rating: 4.4, subscribers: '3.9K', isOnline: true },
    { id: 47, name: 'Jessica Beam', image: '/api/placeholder/300/400', rating: 4.8, subscribers: '10.5K', isOnline: true },
    { id: 48, name: 'Hannah Ray', image: '/api/placeholder/300/400', rating: 4.5, subscribers: '5.2K', isOnline: false },
    { id: 49, name: 'Brittany Star', image: '/api/placeholder/300/400', rating: 4.6, subscribers: '6.7K', isOnline: true },
    { id: 50, name: 'Megan Light', image: '/api/placeholder/300/400', rating: 4.7, subscribers: '7.8K', isOnline: true },
  ]
};

interface Creator {
  id: number;
  name: string;
  image: string;
  rating: number;
  subscribers: string;
  isOnline: boolean;
}

interface CreatorRowProps {
  title: string;
  creators: Creator[];
  icon: React.ReactNode;
}

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

const ModelsShowcase: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('creators');

  const categories = [
    { id: 'creators', name: 'Creators', count: '50+', description: 'Top performing creators' },
    { id: 'views', name: 'Views', count: '1.2M', description: 'Most viewed content' },
    { id: 'purchases', name: 'Purchases', count: '8.9K', description: 'Popular purchases' },
  ];

  // Function to render content based on selected category
  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'creators':
        return (
          <>
            <CreatorRow
              title="Top Performers"
              creators={mockCreators.top}
              icon={<Crown className="h-6 w-6 text-yellow-400" />}
            />
            
            <CreatorRow
              title="Trending Now"
              creators={mockCreators.trending}
              icon={<TrendingUp className="h-6 w-6 text-seductive" />}
            />
            
            <CreatorRow
              title="New & Rising"
              creators={mockCreators.new}
              icon={<Sparkles className="h-6 w-6 text-seductive" />}
            />
          </>
        );
      
      case 'views':
        return (
          <>
            <CreatorRow
              title="Most Viewed This Week"
              creators={mockCreators.trending}
              icon={<TrendingUp className="h-6 w-6 text-seductive" />}
            />
            
            <CreatorRow
              title="Trending Views"
              creators={mockCreators.top}
              icon={<Star className="h-6 w-6 text-seductive" />}
            />
            
            <CreatorRow
              title="Rising in Views"
              creators={mockCreators.new}
              icon={<Sparkles className="h-6 w-6 text-lust-violet" />}
            />
          </>
        );
      
      case 'purchases':
        return (
          <>
            <CreatorRow
              title="Best Sellers"
              creators={mockCreators.blonde}
              icon={<Crown className="h-6 w-6 text-yellow-400" />}
            />
            
            <CreatorRow
              title="Popular Purchases"
              creators={mockCreators.brunette}
              icon={<Heart className="h-6 w-6 text-seductive" />}
            />
            
            <CreatorRow
              title="Recent Purchases"
              creators={mockCreators.top}
              icon={<Sparkles className="h-6 w-6 text-seductive" />}
            />
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-abyss-black min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-abyss-black via-lust-violet/20 to-seductive/20 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-seductive via-void-600 to-lust-violet bg-clip-text text-transparent mb-4 font-serif">
            Discover the <span className="text-shadow-void-glow">Void</span>
          </h1>
          <p className="text-xl text-abyss-light-gray mb-2">Premium creators, exclusive content, unlimited possibilities</p>
          <p className="text-lg text-seductive mb-8 font-medium">Trending Now</p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-4 rounded-xl text-center font-medium transition-all duration-200 min-w-[140px] ${
                  selectedCategory === category.id
                    ? 'bg-seductive text-white shadow-lg scale-105'
                    : 'bg-abyss-black/50 text-abyss-light-gray hover:bg-abyss-black border border-void-500/30 hover:border-seductive/30'
                }`}
              >
                <div className="text-lg font-semibold">{category.name}</div>
                <div className="text-2xl font-bold text-lust-violet mt-1">{category.count}</div>
                <div className="text-xs text-gray-400 mt-1">{category.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Creator Rows */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCategoryContent()}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-abyss-black to-abyss-black py-16 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-void-600 mb-4 font-serif">Ready to join the Void?</h2>
          <p className="text-abyss-light-gray mb-8">Start your premium experience today</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-seductive hover:bg-seductive-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Sign Up Now
            </Link>
            <Link
              to="/become-creator"
              className="bg-lust-violet hover:bg-lust-violet/80 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Become a Creator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelsShowcase;
