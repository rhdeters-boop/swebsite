import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Star, Users, DollarSign } from 'lucide-react';
import AuthSection from '../components/auth/AuthSection';
import FormInput from '../components/form/FormInput';
import VoidLogo from '../components/VoidLogo';
import BackButton from '../components/navigation/BackButton';

const CreateCreatorProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    categories: [] as string[],
    subscriptionPrice: '9.99',
    socialLinks: {
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const availableCategories = [
    'lifestyle', 'fitness', 'fashion', 'travel', 'art', 'music', 
    'gaming', 'cooking', 'photography', 'beauty', 'comedy', 'education'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('social.')) {
      const platform = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [platform]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (error) setError(null);
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.categories.length === 0) {
      setError('Please select at least one category');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/creators/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          displayName: formData.displayName || user?.displayName,
          bio: formData.bio,
          categories: formData.categories,
          subscriptionPrice: Math.round(parseFloat(formData.subscriptionPrice) * 100), // Convert to cents
          socialLinks: formData.socialLinks
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create creator profile');
      }

      // Update user context if needed
      if (data.user) {
        updateUser(data.user);
      }

      // Navigate to creator dashboard or profile
      navigate('/creator/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.displayName.trim()) {
        setError('Display name is required');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
    setError(null);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-seductive to-lust-violet p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Star className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Basic Information</h2>
        <p className="text-gray-400">Let's set up your creator profile</p>
      </div>

      <FormInput
        id="displayName"
        name="displayName"
        label="Creator Display Name"
        type="text"
        value={formData.displayName}
        onChange={handleChange}
        placeholder="Your public creator name"
        required
      />

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={formData.bio}
          onChange={handleChange}
          className="form-input"
          placeholder="Tell your audience about yourself..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Content Categories
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {availableCategories.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryToggle(category)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.categories.includes(category)
                  ? 'bg-seductive text-white'
                  : 'bg-surface-secondary text-gray-300 hover:bg-surface-tertiary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        {formData.categories.length > 0 && (
          <p className="text-sm text-gray-400 mt-2">
            Selected: {formData.categories.join(', ')}
          </p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-seductive to-lust-violet p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <DollarSign className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Pricing</h2>
        <p className="text-gray-400">Set your subscription price</p>
      </div>

      <FormInput
        id="subscriptionPrice"
        name="subscriptionPrice"
        label="Monthly Subscription Price ($)"
        type="text"
        value={formData.subscriptionPrice}
        onChange={handleChange}
        placeholder="9.99"
      />

      <div className="bg-gradient-to-r from-seductive/10 to-lust-violet/10 border border-seductive/20 rounded-lg p-4">
        <h4 className="text-seductive font-semibold text-sm mb-2">💰 Pricing Tips</h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Start with a competitive price to build your audience</li>
          <li>• You can adjust your price later based on demand</li>
          <li>• Consider offering special promotions for new subscribers</li>
          <li>• Higher prices work well for exclusive or premium content</li>
        </ul>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-seductive to-lust-violet p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Users className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Social Links</h2>
        <p className="text-gray-400">Connect your social media (optional)</p>
      </div>

      <FormInput
        id="social.instagram"
        name="social.instagram"
        label="Instagram"
        type="text"
        value={formData.socialLinks.instagram}
        onChange={handleChange}
        placeholder="@your_instagram"
      />

      <FormInput
        id="social.twitter"
        name="social.twitter"
        label="Twitter/X"
        type="text"
        value={formData.socialLinks.twitter}
        onChange={handleChange}
        placeholder="@your_twitter"
      />

      <FormInput
        id="social.youtube"
        name="social.youtube"
        label="YouTube"
        type="text"
        value={formData.socialLinks.youtube}
        onChange={handleChange}
        placeholder="Your YouTube channel URL"
      />

      <FormInput
        id="social.tiktok"
        name="social.tiktok"
        label="TikTok"
        type="text"
        value={formData.socialLinks.tiktok}
        onChange={handleChange}
        placeholder="@your_tiktok"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
      <AuthSection 
        title="Create Creator Profile"
        subtitle="Set up your creator account to start earning"
      >
        <div className="text-center mb-8">
          <VoidLogo className="w-16 h-20 mx-auto mb-4" />
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BackButton />
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-seductive text-white' : 'bg-surface-secondary text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    step < currentStep ? 'bg-seductive' : 'bg-surface-secondary'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {error && (
            <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 btn-secondary"
              >
                Previous
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || formData.categories.length === 0}
                className="flex-1 btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </button>
            )}
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Need help? Contact our{' '}
            <Link to="/support" className="text-seductive hover:text-seductive-light">
              support team
            </Link>
          </p>
        </div>
      </AuthSection>
    </div>
  );
};

export default CreateCreatorProfile;
