import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Circle, 
  Star, 
  Video, 
  Users, 
  Crown,
  ArrowRight,
  DollarSign,
  Shield
} from 'lucide-react';

const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();

  
  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Discover Amazing Creators",
      description: "Browse and subscribe to talented creators producing exclusive content"
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: "Premium Content Access",
      description: "Unlock photo galleries and video content from your favorite creators"
    },
    {
      icon: <Crown className="h-8 w-8" />,
      title: "Flexible Subscriptions",
      description: "Choose subscription tiers that match your interests and budget"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Private",
      description: "Safe payments and private access to exclusive creator content"
    }
  ];

  

  return (
    <div className="min-h-screen text-[#fdefea]" style={{ backgroundColor: '#0a020d' }}>
      {/* Hero Section */}
<section className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center" style={{ backgroundImage: 'url(/background2.jpg)' }}>
  <div className="absolute inset-0 bg-black bg-opacity-70"></div> {/* Transparent overlay */}
  {/* Transparent overlay */}
  <div className="absolute inset-0 bg-black bg-opacity-50"></div> {/* Transparent overlay */}
  <div className="relative max-w-7xl mx-auto text-center z-10"> {/* Text content */}
    <div className="flex justify-center mb-6">
      <Circle className="h-16 w-16" style={{ color: '#6400c2' }} />
    </div>
    
    <h1 className="text-4xl md:text-6xl font-bold mb-6 flex justify-center">
      <div className="flex flex-col items-start">
        <span className="text-2xl md:text-4xl" style={{ color: '#fdefea' }}>Enter the</span>
        <span className="text-5xl md:text-7xl flex items-center space-x-0">
          <span className="pr-0" style={{ color: '#6400c2' }}>Void</span>
          <span className="text-5xl" style={{ color: '#8d1614ff' }}>of Desire</span>
        </span>
      </div>
    </h1>

    <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ color: '#fdefea' }}>
      Subscribe to your favorite creators and unlock exclusive photo galleries and video content. 
      Join thousands of subscribers enjoying premium, high-quality content from talented creators.
    </p>
    
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      {isAuthenticated ? (
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/gallery" className="text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 inline-flex items-center hover:opacity-90" style={{ backgroundColor: '#6c13a4' }}>
            <Video className="h-5 w-5 mr-2" />
            Browse Content
          </Link>
          <Link to="/creators" className="text-white font-semibold px-8 py-4 rounded-lg border transition-colors duration-200 inline-flex items-center hover:opacity-90" style={{ backgroundColor: '#2d0043', borderColor: '#5b175d' }}>
            <Users className="h-5 w-5 mr-2" />
            Discover Creators
          </Link>
        </div>
      ) : (
        <>
          <Link to="/register" className="text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 inline-flex items-center hover:opacity-90" style={{ backgroundColor: '#6c13a4' }}>
            <Crown className="h-5 w-5 mr-2" />
            Start Subscribing
          </Link>
          <Link to="/creators" className="text-white font-semibold px-8 py-4 rounded-lg border transition-colors duration-200 inline-flex items-center hover:opacity-90" style={{ backgroundColor: '#2d0043', borderColor: '#5b175d' }}>
            Browse Creators
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </>
      )}
    </div>
  </div>
</section>




      {/* Features Section */}
      <section className="py-20" style={{ backgroundColor: '#0e0216' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#FAF9F6] mb-4">
              Why Choose Void of Desire?
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#5b175d' }}>
              Experience the difference with our carefully curated content and user-friendly platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="rounded-lg p-6 text-center transition-colors duration-200 hover:opacity-90" style={{ backgroundColor: '#0e0216' }}>
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full text-white" style={{ backgroundColor: '#6c13a4' }}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-[#FAF9F6] mb-2">
                  {feature.title}
                </h3>
                <p className="leading-relaxed" style={{ color: '#FAF9F6' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="relative py-20" style={{ backgroundColor: '#0e0216' }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#FAF9F6] mb-4">
              Content site for creators
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: '#FAF9F6' }}>
              Turn your passion into income. Join our platform and start earning from your content today.
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="max-w-2xl">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6c13a4' }}>
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#FAF9F6] mb-2">Set Your Own Prices</h4>
                    <p style={{ color: '#FAF9F6' }}>Full control over your subscription pricing and earning potential</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6c13a4' }}>
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#FAF9F6] mb-2">Secure Platform</h4>
                    <p style={{ color: '#FAF9F6' }}>Your content and payments are protected with enterprise-level security</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6c13a4' }}>
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#FAF9F6] mb-2">Build Your Community</h4>
                    <p style={{ color: '#FAF9F6' }}>Connect with fans and build lasting relationships with your audience</p>
                  </div>
                </div>
                
                {/* TODO: Add Analytics & Growth feature in the future
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6c13a4' }}>
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Analytics & Growth</h4>
                    <p style={{ color: '#2d0043' }}>Track your performance and grow your subscriber base with detailed insights</p>
                  </div>
                </div>
                */}
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6c13a4' }}>
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#FAF9F6] mb-2">The Money You Earn Is Yours</h4>
                    <p style={{ color: '#FAF9F6' }}>No initial costs to join. We only take a flat 5% commission on your earnings</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <Link to="/become-creator" className="text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 inline-flex items-center hover:opacity-90" style={{ backgroundColor: '#6c13a4' }}>
                  <Star className="h-5 w-5 mr-2" />
                  Become a Creator
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
