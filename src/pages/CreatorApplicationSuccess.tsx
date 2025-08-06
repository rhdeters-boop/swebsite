import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Star, Heart, Users, ArrowRight } from 'lucide-react';

const CreatorApplicationSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="py-2 sm:py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <div className="flex justify-center space-x-2">
            <Star className="h-8 w-8 text-brand-pink fill-current animate-pulse" />
            <Heart className="h-8 w-8 text-brand-pink fill-current animate-pulse delay-100" />
            <Users className="h-8 w-8 text-brand-pink fill-current animate-pulse delay-200" />
          </div>
        </div>

        {/* Main Content */}
        <h1 className="text-4xl font-bold gradient-text mb-6">
          Application Submitted Successfully! 🎉
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Thank you for applying to become a creator on our platform! 
          We're excited to review your application.
        </p>

        {/* What's Next Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What's Next?</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-pink text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Application Review</h3>
                <p className="text-gray-600 text-sm">
                  Our team will review your application within 24-48 hours. We'll check your profile, 
                  categories, and ensure everything meets our community guidelines.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-pink text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Email Notification</h3>
                <p className="text-gray-600 text-sm">
                  You'll receive an email notification once your application has been approved or if we need 
                  any additional information from you.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-pink text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Start Creating</h3>
                <p className="text-gray-600 text-sm">
                  Once approved, you'll gain access to your creator dashboard where you can upload content, 
                  manage subscribers, and start earning!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Creator Benefits Reminder */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            While You Wait, Here's What You'll Get as a Creator:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Set your own subscription pricing</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Receive tips from fans</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Build your community</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Analytics and insights</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Secure payment processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">24/7 creator support</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/creators')}
            className="w-full btn-primary flex items-center justify-center"
          >
            Browse Other Creators
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full btn-secondary"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Contact Information */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Have questions about your application? 
            <br />
            Contact our support team at{' '}
            <a href="mailto:creators@ourplatform.com" className="text-brand-pink hover:underline">
              creators@ourplatform.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreatorApplicationSuccess;
