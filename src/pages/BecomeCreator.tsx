import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { 
  Star, 
  Users, 
  DollarSign, 
  Camera, 
  Heart,
  TrendingUp,
  Shield,
  Award,
  ChevronRight,
  X
} from 'lucide-react';

const BecomeCreator: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    categories: [] as string[],
    subscriptionPrice: 999, // $9.99 in cents
    socialLinks: {
      instagram: '',
      twitter: '',
      tiktok: '',
      onlyfans: ''
    }
  });

  const availableCategories = [
    'Lifestyle', 'Fitness', 'Beauty', 'Fashion', 'Art', 
    'Photography', 'Travel', 'Cooking', 'Music', 'Entertainment'
  ];

  const benefits = [
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Earn Monthly Income",
      description: "Set your own subscription price and earn recurring revenue from your content"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Build Your Community",
      description: "Connect with fans who appreciate your content and build lasting relationships"
    },
    {
      icon: <Camera className="h-8 w-8" />,
      title: "Share Your Passion",
      description: "Upload photos and videos showcasing what you love most"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Grow Your Brand",
      description: "Expand your reach and establish yourself as a content creator"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure Platform",
      description: "Your content is protected with secure hosting and payment processing"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Creator Support",
      description: "Get help and resources to succeed as a creator on our platform"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category].slice(0, 5) // Max 5 categories
    }));
  };

  const [submitError, setSubmitError] = useState<string>('');

  // Submit creator application
  const submitApplication = useMutation({
    mutationFn: async (applicationData: typeof formData) => {
      const response = await fetch('/api/creators/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }

      return response.json();
    },
    onSuccess: () => {
      // Navigate to success page or creator dashboard
      navigate('/creator/application-success');
    },
    onError: (error: Error) => {
      setSubmitError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    // Validate required fields
    if (!formData.displayName.trim()) {
      setSubmitError('Display name is required');
      return;
    }
    if (!formData.bio.trim()) {
      setSubmitError('Bio is required');
      return;
    }
    if (formData.categories.length === 0) {
      setSubmitError('Please select at least one category');
      return;
    }

    submitApplication.mutate(formData);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (!isAuthenticated) {
    return (
      <div className="py-2 sm:py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Heart className="h-16 w-16 text-brand-pink mx-auto mb-6" />
          <h1 className="text-3xl font-bold gradient-text mb-4">
            Join as a Creator
          </h1>
          <p className="text-gray-600 mb-8">
            Please log in or create an account to start your creator journey
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn-secondary"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 sm:py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Star className="h-16 w-16 text-brand-pink mx-auto mb-6" fill="currentColor" />
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Become a Creator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of creators earning money by sharing their passion. 
            Start your journey today and turn your content into income.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="card text-center group hover:shadow-xl transition-all duration-300">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full text-brand-pink group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Application Form */}
        <div className="card max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step <= currentStep
                      ? 'bg-brand-pink text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-brand-pink h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center gradient-text mb-6">
                  Tell Us About Yourself
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    required
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                    placeholder="How you want to be known as a creator"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                    placeholder="Tell your audience about yourself and what kind of content you create..."
                    maxLength={1000}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.bio.length}/1000 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories * (Select up to 5)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategoryToggle(category)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                          formData.categories.includes(category)
                            ? 'bg-brand-pink text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                        {formData.categories.includes(category) && (
                          <X className="h-3 w-3 ml-1 inline" />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.categories.length}/5 selected
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Pricing */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center gradient-text mb-6">
                  Set Your Subscription Price
                </h2>
                
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-brand-pink mb-2">
                    ${(formData.subscriptionPrice / 100).toFixed(2)}
                  </div>
                  <p className="text-gray-600">per month</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Subscription Price
                  </label>
                  <input
                    type="range"
                    min="299"
                    max="9999"
                    step="100"
                    value={formData.subscriptionPrice}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      subscriptionPrice: parseInt(e.target.value)
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>$2.99</span>
                    <span>$99.99</span>
                  </div>
                </div>

                <div className="bg-pink-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Pricing Tips:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Start with a competitive price to attract initial subscribers</li>
                    <li>• You can adjust your price anytime from your creator dashboard</li>
                    <li>• Consider offering special promotions for early supporters</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 3: Social Links */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-center gradient-text mb-6">
                  Connect Your Social Media
                </h2>
                
                <p className="text-center text-gray-600 mb-6">
                  Link your social media accounts to help fans find and follow you (optional)
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="url"
                      name="social.instagram"
                      value={formData.socialLinks.instagram}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                      placeholder="https://instagram.com/yourusername"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter/X
                    </label>
                    <input
                      type="url"
                      name="social.twitter"
                      value={formData.socialLinks.twitter}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                      placeholder="https://twitter.com/yourusername"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TikTok
                    </label>
                    <input
                      type="url"
                      name="social.tiktok"
                      value={formData.socialLinks.tiktok}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                      placeholder="https://tiktok.com/@yourusername"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OnlyFans
                    </label>
                    <input
                      type="url"
                      name="social.onlyfans"
                      value={formData.socialLinks.onlyfans}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-pink focus:border-transparent"
                      placeholder="https://onlyfans.com/yourusername"
                    />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Ready to Launch!</h3>
                  <p className="text-sm text-green-700">
                    Your creator profile is almost ready. Click submit to complete your application 
                    and start earning from your content.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{submitError}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && (!formData.displayName || formData.categories.length === 0))
                  }
                  className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-5 w-5 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitApplication.isPending}
                  className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitApplication.isPending ? 'Submitting...' : 'Submit Application'}
                  <Star className="h-5 w-5 ml-1" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BecomeCreator;
