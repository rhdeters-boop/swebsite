import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Star, 
  Video, 
  Users, 
  Crown,
  ArrowRight,
  DollarSign,
  Shield
} from 'lucide-react';
import LogoTitle from '../components/LogoTitle';
import ActionButton from '../components/ActionButton';

const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();

  
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Discreet & Private",
      description: "Explore your desires with peace of mind. Our platform ensures discreet billing so not even your bank knows what you are up to."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Exclusive Creators",
      description: "Discover creators we personally recruited so you won't find them anywhere else."
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: "Seamless Experience",
      description: "Your fantasies, all in one place. Enjoy your unlocked content effortlessly, anytime you wish."
    },
    {
      icon: <Crown className="h-8 w-8" />,
      title: "Personalized Desires",
      description: "Beyond subscriptions, you can negotiate prices or commission custom content that's uniquely yours."
    },
    
  ];

  

  return (
    <div className="min-h-screen text-abyss-light-gray bg-abyss-black font-sans">
      {/* Hero Section */}
      <section className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-hero">
        <div className="absolute inset-0 bg-abyss-black bg-opacity-70"></div> {/* Transparent overlay */}
        <div className="relative max-w-7xl mx-auto text-center z-10"> {/* Text content */}
          
          <div className="flex justify-center mb-8">
            <LogoTitle />
          </div>

          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed text-abyss-light-gray">
            Subscribe to your favorite creators and unlock exclusive photo galleries and video content. 
            Join thousands of subscribers enjoying premium, high-quality content from talented creators.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <ActionButton to="/gallery" icon={Video}>
                  Browse Content
                </ActionButton>
                <ActionButton to="/creators" variant="secondary" icon={Users}>
                  Discover Creators
                </ActionButton>
              </div>
            ) : (
              <>
                <ActionButton to="/register" icon={Crown}>
                  Start Subscribing
                </ActionButton>
                <ActionButton to="/creators" variant="secondary" icon={ArrowRight} iconPosition="right">
                  Browse Creators
                </ActionButton>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-abyss-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-abyss-light-gray mb-4 font-serif">
              Why Choose Void of Desire?
            </h2>
            <p className="text-xl max-w-2xl mx-auto text-lust-violet">
              Experience the difference with our carefully curated content and user-friendly platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="rounded-lg p-6 text-center transition-colors duration-200 hover:opacity-90 bg-abyss-black">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full text-white bg-lust-violet">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-abyss-light-gray mb-2 font-serif">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-abyss-light-gray">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="relative py-20 bg-abyss-black">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-abyss-light-gray mb-4 font-serif">
              Content site for creators
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-abyss-light-gray">
              Turn your passion into income. Join our platform and start earning from your content today.
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="max-w-2xl">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-lust-violet">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-abyss-light-gray mb-2 font-serif">Set Your Own Prices</h4>
                    <p className="text-abyss-light-gray">Full control over your subscription pricing and earning potential</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-lust-violet">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-abyss-light-gray mb-2 font-serif">Secure Platform</h4>
                    <p className="text-abyss-light-gray">Your content and payments are protected with enterprise-level security</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-lust-violet">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-abyss-light-gray mb-2 font-serif">Build Your Community</h4>
                    <p className="text-abyss-light-gray">Connect with fans and build lasting relationships with your audience</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-lust-violet">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-abyss-light-gray mb-2 font-serif">The Money You Earn Is Yours</h4>
                    <p className="text-abyss-light-gray">No initial costs to join. We only take a flat 5% commission on your earnings</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <ActionButton to="/become-creator" icon={Star} rightIcon={ArrowRight}>
                  Become a Creator
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;