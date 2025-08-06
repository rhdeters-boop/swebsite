import React from 'react';
import { useParams } from 'react-router-dom';
import { Image, Video, Lock } from 'lucide-react';

const MediaGallery: React.FC = () => {
  const { tier } = useParams();

  return (
    <div className="py-2 sm:py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text">
            Media Gallery {tier && `- ${tier.replace('_', ' ')} Content`}
          </h1>
          <p className="text-gray-600 mt-2">Explore your premium content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder content */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="card">
              <div className="aspect-square bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg mb-4 flex items-center justify-center">
                {item % 2 === 0 ? (
                  <Video className="h-12 w-12 text-brand-pink" />
                ) : (
                  <Image className="h-12 w-12 text-brand-pink" />
                )}
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Premium Content {item}
              </h3>
              <p className="text-gray-600 text-sm">
                Exclusive {item % 2 === 0 ? 'video' : 'photo'} content for subscribers
              </p>
            </div>
          ))}
          
          {/* Locked content example */}
          <div className="card opacity-50">
            <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <Lock className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-500 mb-2">
              Upgrade Required
            </h3>
            <p className="text-gray-400 text-sm">
              Upgrade your subscription to access this content
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaGallery;
