import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface Creator {
  id: number;
  name: string;
  image: string;
  rating: number;
  subscribers: string;
  isOnline: boolean;
  subscriptionType?: 'free' | 'basic' | 'premium';
}

interface CreatorCarouselProps {
  title: string;
  creators: Creator[];
  icon: React.ReactNode;
  onSeeMore: () => void;
  CreatorCardComponent: React.ComponentType<{ creator: Creator }>;
}

const CreatorCarousel: React.FC<CreatorCarouselProps> = ({ 
  title, 
  creators, 
  icon, 
  onSeeMore,
  CreatorCardComponent
}) => {
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
                <CreatorCardComponent creator={creator} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorCarousel;
export type { Creator, CreatorCarouselProps };
