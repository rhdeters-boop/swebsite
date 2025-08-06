import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, MessageCircle, Book, Search } from 'lucide-react';

const HelpCenter: React.FC = () => {
  const helpCategories = [
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Getting Started",
      description: "Learn the basics of using our platform",
      articles: [
        "How to create an account",
        "Setting up your profile",
        "Understanding subscriptions",
        "How to follow creators"
      ]
    },
    {
      icon: <Book className="h-8 w-8" />,
      title: "For Creators",
      description: "Everything you need to know as a content creator",
      articles: [
        "Becoming a creator",
        "Uploading content",
        "Managing subscriptions",
        "Earnings and payouts"
      ]
    },
    {
      icon: <HelpCircle className="h-8 w-8" />,
      title: "Account & Billing",
      description: "Manage your account and payment information",
      articles: [
        "Payment methods",
        "Subscription management",
        "Refund policy",
        "Account security"
      ]
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "Technical Support",
      description: "Troubleshooting and technical assistance",
      articles: [
        "Video playback issues",
        "Upload problems",
        "Login difficulties",
        "Browser compatibility"
      ]
    }
  ];

  return (
    <div className="bg-abyss-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <HelpCircle className="h-16 w-16 text-seductive mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4 font-serif">
            Help Center
          </h1>
          <p className="text-xl text-abyss-light-gray">
            Find answers to your questions and get the help you need
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-abyss-light-gray" />
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full pl-10 pr-4 py-3 bg-abyss-dark-900 border border-void-500/30 rounded-lg text-white placeholder-abyss-light-gray focus:ring-2 focus:ring-seductive focus:border-seductive"
            />
          </div>
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {helpCategories.map((category, index) => (
            <div key={index} className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-6 hover:border-seductive/50 transition-colors duration-200">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-seductive/10 rounded-lg text-seductive mr-4">
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{category.title}</h3>
                  <p className="text-abyss-light-gray text-sm">{category.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {category.articles.map((article, articleIndex) => (
                  <li key={articleIndex}>
                    <a
                      href="#"
                      className="text-abyss-light-gray hover:text-seductive transition-colors duration-200 text-sm"
                    >
                      {article}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-seductive/10 to-lust-violet/10 border border-seductive/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-abyss-light-gray mb-6">
            Our support team is here to help you with any questions or issues.
          </p>
          <Link
            to="/contact"
            className="bg-gradient-to-r from-lust-violet to-seductive text-white px-8 py-3 rounded-lg font-semibold hover:shadow-glow-primary transition-all duration-300 transform hover:scale-[1.02] inline-block"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
