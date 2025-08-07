import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera } from 'lucide-react';
import AuthSection from '../components/auth/AuthSection';
import FormInput from '../components/form/FormInput';

const CreateProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    profileImage: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement profile creation API call
      console.log('Creating profile with:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Profile creation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
    <AuthSection
      title="Create Your Profile"
      subtitle="Tell the community a bit about yourself"
      icon={<User className="h-12 w-12 text-void-accent" />}
      footer={
        <div className="text-sm text-gray-400">
          <p>You can always update your profile later</p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Upload */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 bg-void-dark-900/50 rounded-full flex items-center justify-center border-2 border-void-500/30">
              {formData.profileImage ? (
                <img
                  src={URL.createObjectURL(formData.profileImage)}
                  alt="Profile preview"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Camera className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <p className="text-sm text-gray-400">Click to upload profile picture</p>
        </div>

        <FormInput
          id="displayName"
          name="displayName"
          label="Display Name"
          value={formData.displayName}
          onChange={handleChange}
          placeholder="How should we display your name?"
          required
        />

        <div className="space-y-2">
          <label htmlFor="bio" className="block text-sm font-medium text-abyss-light-gray">
            Bio <span className="text-gray-500">(optional)</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell people a bit about yourself..."
            rows={4}
            className="form-input resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-500">
            {formData.bio.length}/500 characters
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 px-4 py-2 border border-void-500/30 text-gray-300 rounded-lg hover:bg-void-dark-900/50 transition-colors duration-200"
          >
            Skip for now
          </button>
          <button
            type="submit"
            disabled={isLoading || !formData.displayName.trim()}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Profile'}
          </button>
        </div>
      </form>
    </AuthSection>
    </div>
  );
};

export default CreateProfile;
