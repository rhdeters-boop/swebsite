import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Check, 
  Heart, 
  Image, 
  Video, 
  Users, 
  Crown, 
  Star,
  Gift
} from 'lucide-react';

const SubscriptionTiers: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const tiers = [
    {
      id: 'picture',
      name: 'Picture Tier',
      price: 9.99,
      description: 'Access to premium photo galleries',
      icon: <Image className="h-8 w-8" />,
      features: [
        'Access to all premium photo galleries',
        'High-resolution image downloads',
        'Weekly new content updates',
        'Mobile-friendly viewing',
        'Basic community access',
        'Customer support'
      ],
      popular: false,
      gradient: 'from-pink-400 to-pink-600',
      bgGradient: 'from-pink-50 to-pink-100'
    },
    {
      id: 'solo_video',
      name: 'Solo Video Tier',
      price: 19.99,
      description: 'Everything in Picture Tier + solo video content',
      icon: <Video className="h-8 w-8" />,
      features: [
        'Everything in Picture Tier',
        'Access to exclusive solo video content',
        'HD video streaming',
        'Offline video downloads',
        'Priority content updates',
        'Extended community features',
        'Priority customer support'
      ],
      popular: true,
      gradient: 'from-purple-400 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-100'
    },
    {
      id: 'collab_video',
      name: 'Collab Video Tier',
      price: 29.99,
      description: 'Complete access to all content including collaborations',
      icon: <Users className="h-8 w-8" />,
      features: [
        'Everything in previous tiers',
        'Exclusive collaborative video content',
        '4K video quality',
        'Behind-the-scenes content',
        'Live streaming access',
        'VIP community features',
        'Direct messaging privileges',
        'Monthly bonus content',
        'Priority customer support'
      ],
      popular: false,
      gradient: 'from-purple-600 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-100'
    }
  ];

  const handleSubscribe = (tierId: string) => {
    if (!isAuthenticated) {
      // Redirect to register with tier info
      window.location.href = `/register?tier=${tierId}`;
    } else {
      // Redirect to payment flow
      window.location.href = `/checkout/${tierId}`;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Crown className="h-16 w-16 text-brand-pink" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Support your favorite creators with flexible subscription tiers designed to fit your preferences and budget.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative tier-card ${tier.popular ? 'featured' : ''} ${tier.popular ? 'transform scale-105' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-brand-pink to-brand-pink-dark text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Star className="h-4 w-4 mr-1" fill="currentColor" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`inline-flex p-4 rounded-full bg-gradient-to-br ${tier.bgGradient} mb-4`}>
                  <div className={`text-transparent bg-clip-text bg-gradient-to-r ${tier.gradient}`}>
                    {tier.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {tier.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {tier.description}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-800">
                    ${tier.price}
                  </span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(tier.id)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                  tier.popular
                    ? 'bg-gradient-to-r from-brand-pink to-brand-pink-dark text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {isAuthenticated ? 'Subscribe Now' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-center gradient-text mb-8">
            What's Included With Every Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Heart className="h-12 w-12 text-brand-pink mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Support Creators</h3>
              <p className="text-gray-600 text-sm">Direct support to your favorites</p>
            </div>
            <div className="text-center">
              <Gift className="h-12 w-12 text-brand-pink mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Cancel Anytime</h3>
              <p className="text-gray-600 text-sm">No long-term commitments</p>
            </div>
            <div className="text-center">
              <Crown className="h-12 w-12 text-brand-pink mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Premium Quality</h3>
              <p className="text-gray-600 text-sm">High-resolution content</p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-brand-pink mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Community Access</h3>
              <p className="text-gray-600 text-sm">Connect with other subscribers</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gradient-to-br from-pink-50 to-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center gradient-text mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600 text-sm">Yes! You can change your subscription tier at any time from your dashboard.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">How does billing work?</h3>
              <p className="text-gray-600 text-sm">You'll be billed monthly for your subscription. All payments are secure and processed by Stripe.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">We accept all major credit cards, debit cards, and digital wallets through Stripe.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Is my data secure?</h3>
              <p className="text-gray-600 text-sm">Absolutely! We use industry-standard encryption and never store your payment information.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        {!isAuthenticated && (
          <div className="text-center mt-16">
            <p className="text-gray-600 mb-6">
              Ready to get started? Create your account and start supporting creators today!
            </p>
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              Join Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionTiers;
