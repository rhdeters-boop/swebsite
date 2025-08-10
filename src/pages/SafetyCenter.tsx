import React, { useState } from 'react';
import { Shield, AlertTriangle, Users, Heart, Phone, Lock, Eye, UserX, Bell, HelpCircle } from 'lucide-react';
import { getLegalDocument } from '../data/legalContent';

const SafetyCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'resources'>('overview');
  const safetyDoc = getLegalDocument('safety');

  const safetyFeatures = [
    {
      icon: <UserX className="h-8 w-8" />,
      title: "Block & Report",
      description: "Block unwanted users and report inappropriate content or behavior",
      link: "/help/safety/blocking"
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: "Privacy Controls",
      description: "Control who can see your content and interact with you",
      link: "/account-settings#privacy"
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Account Security",
      description: "Two-factor authentication and secure login options",
      link: "/security"
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Content Filters",
      description: "Customize what content you see based on your preferences",
      link: "/account-settings#content"
    }
  ];

  const emergencyResources = [
    {
      name: "National Suicide Prevention Lifeline",
      phone: "988",
      description: "24/7 support for people in distress",
      available: "Available 24/7"
    },
    {
      name: "Crisis Text Line",
      phone: "Text HOME to 741741",
      description: "Free, 24/7 support via text message",
      available: "Available 24/7"
    },
    {
      name: "RAINN National Sexual Assault Hotline",
      phone: "1-800-656-4673",
      description: "Confidential support for survivors",
      available: "Available 24/7"
    },
    {
      name: "National Domestic Violence Hotline",
      phone: "1-800-799-7233",
      description: "Support for domestic violence victims",
      available: "Available 24/7"
    }
  ];

  const safetyTips = [
    {
      category: "Personal Information",
      tips: [
        "Never share your password with anyone",
        "Be cautious about sharing personal details like your address or phone number",
        "Use a username that doesn't reveal your real name",
        "Review your privacy settings regularly"
      ]
    },
    {
      category: "Meeting People",
      tips: [
        "Never meet someone in person that you've only met online without proper precautions",
        "If you do meet, choose a public place and tell someone where you're going",
        "Trust your instincts - if something feels wrong, it probably is",
        "Consider video chatting before meeting in person"
      ]
    },
    {
      category: "Financial Safety",
      tips: [
        "Never send money to someone you've only met online",
        "Be wary of requests for financial help or investments",
        "Use our platform's payment system - never go outside it",
        "Report any suspicious financial requests immediately"
      ]
    },
    {
      category: "Content Creation",
      tips: [
        "Only share content you're comfortable with",
        "Remember that content can be screenshot or recorded",
        "Watermark your content when possible",
        "Set clear boundaries with your audience"
      ]
    }
  ];

  return (
    <div className="bg-abyss-black min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 text-pink-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4 font-serif">
            Safety Center
          </h1>
          <p className="text-lg text-abyss-light-gray max-w-3xl mx-auto">
            Your safety is our top priority. Find resources, tools, and information to help you have a safe and positive experience on our platform.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-abyss-dark-900 border border-void-500/30 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-pink-500 text-white'
                  : 'text-abyss-light-gray hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'tools'
                  ? 'bg-pink-500 text-white'
                  : 'text-abyss-light-gray hover:text-white'
              }`}
            >
              Safety Tools
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'resources'
                  ? 'bg-pink-500 text-white'
                  : 'text-abyss-light-gray hover:text-white'
              }`}
            >
              Resources
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Safety Features Grid */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Safety Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {safetyFeatures.map((feature, index) => (
                  <a
                    key={index}
                    href={feature.link}
                    className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-6 hover:border-pink-500/50 transition-all duration-300 group"
                  >
                    <div className="text-pink-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-abyss-light-gray text-sm">{feature.description}</p>
                  </a>
                ))}
              </div>
            </div>

            {/* Safety Tips */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Safety Tips
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {safetyTips.map((section, index) => (
                  <div key={index} className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-pink-500 mb-4">{section.category}</h3>
                    <ul className="space-y-2">
                      {section.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start">
                          <span className="text-pink-500 mr-2 mt-1">•</span>
                          <span className="text-abyss-light-gray text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-pink-500/10 to-lust-violet/10 border border-pink-500/20 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Need Help Right Now?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="/support/submit?category=safety"
                  className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-all duration-300 text-center"
                >
                  Report Safety Issue
                </a>
                <a
                  href="/help/safety/emergency"
                  className="bg-abyss-dark-900 text-pink-500 border border-pink-500 px-6 py-3 rounded-lg font-semibold hover:bg-pink-500 hover:text-white transition-all duration-300 text-center"
                >
                  Emergency Resources
                </a>
                <a
                  href="/support/submit"
                  className="bg-abyss-dark-900 text-white border border-void-500/30 px-6 py-3 rounded-lg font-semibold hover:border-white transition-all duration-300 text-center"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-8">
            {/* Safety Document Sections */}
            {safetyDoc?.sections.map((section) => (
              <div key={section.id} className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">{section.title}</h2>
                <p className="text-abyss-light-gray leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-8">
            {/* Crisis Resources */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Crisis Resources
              </h2>
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                  <p className="text-red-300 font-medium">
                    If you or someone you know is in immediate danger, please call 911 or your local emergency services.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {emergencyResources.map((resource, index) => (
                  <div key={index} className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{resource.name}</h3>
                        <p className="text-pink-500 font-bold text-xl mt-1">{resource.phone}</p>
                      </div>
                      <Phone className="h-6 w-6 text-pink-500" />
                    </div>
                    <p className="text-abyss-light-gray text-sm mb-2">{resource.description}</p>
                    <p className="text-seductive text-xs">{resource.available}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Resources */}
            <div className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Additional Support</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-pink-500 mb-2">Online Safety Resources</h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="https://www.ncmec.org" target="_blank" rel="noopener noreferrer" className="text-abyss-light-gray hover:text-pink-500 transition-colors">
                        National Center for Missing & Exploited Children →
                      </a>
                    </li>
                    <li>
                      <a href="https://www.cybercivilrights.org" target="_blank" rel="noopener noreferrer" className="text-abyss-light-gray hover:text-pink-500 transition-colors">
                        Cyber Civil Rights Initiative →
                      </a>
                    </li>
                    <li>
                      <a href="https://www.connectsafely.org" target="_blank" rel="noopener noreferrer" className="text-abyss-light-gray hover:text-pink-500 transition-colors">
                        ConnectSafely - Internet Safety →
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <p className="text-abyss-light-gray mb-4">
            Remember: Your safety is important to us. Never hesitate to reach out if you need help.
          </p>
          <div className="flex items-center justify-center gap-2 text-pink-500">
            <Heart className="h-5 w-5" />
            <span className="font-medium">Stay Safe, Stay Connected</span>
            <Heart className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyCenter;