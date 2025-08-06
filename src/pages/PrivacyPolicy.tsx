import React from 'react';
import { Shield, Eye, Database, Lock, UserCheck, Settings } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      icon: <Database className="h-6 w-6" />,
      title: "Information We Collect",
      content: `We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes personal information like your name, email address, payment information, and content you upload to our platform.`
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "How We Use Your Information",
      content: `We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and promotional offers.`
    },
    {
      icon: <UserCheck className="h-6 w-6" />,
      title: "Information Sharing",
      content: `We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with service providers who assist us in operating our platform.`
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Data Security",
      content: `We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.`
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Your Rights and Choices",
      content: `You have the right to access, update, or delete your personal information. You can also opt out of certain communications and control how your information is used for advertising purposes.`
    }
  ];

  const dataTypes = [
    {
      type: "Account Information",
      description: "Username, email address, password, profile information",
      retention: "Until account deletion"
    },
    {
      type: "Payment Information",
      description: "Billing address, payment method details (processed securely)",
      retention: "Until payment method is removed"
    },
    {
      type: "Content Data",
      description: "Photos, videos, comments, and other content you upload",
      retention: "Until you delete the content"
    },
    {
      type: "Usage Information",
      description: "How you interact with our platform, viewing history",
      retention: "Up to 2 years"
    },
    {
      type: "Device Information",
      description: "Browser type, IP address, device identifiers",
      retention: "Up to 1 year"
    }
  ];

  return (
    <div className="bg-abyss-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 text-seductive mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4 font-serif">
            Privacy Policy
          </h1>
          <p className="text-lg text-abyss-light-gray mb-4">
            Last Updated: January 1, 2024
          </p>
          <div className="bg-seductive/10 border border-seductive/20 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-abyss-light-gray">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-8 mb-12">
          {sections.map((section, index) => (
            <div key={index} className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-8">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-seductive/10 rounded-lg text-seductive mr-4">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
              </div>
              <p className="text-abyss-light-gray leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Data Collection Table */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Types of Data We Collect
          </h2>
          <div className="bg-abyss-dark-900 border border-void-500/30 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-abyss-dark-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Data Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Retention Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-void-500/20">
                  {dataTypes.map((item, index) => (
                    <tr key={index} className="hover:bg-abyss-dark-800/50">
                      <td className="px-6 py-4 text-sm font-medium text-seductive">{item.type}</td>
                      <td className="px-6 py-4 text-sm text-abyss-light-gray">{item.description}</td>
                      <td className="px-6 py-4 text-sm text-abyss-light-gray">{item.retention}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-seductive/10 to-lust-violet/10 border border-seductive/20 rounded-xl p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-seductive mr-3" />
            <h2 className="text-2xl font-bold text-white">
              Questions about your privacy?
            </h2>
          </div>
          <p className="text-abyss-light-gray mb-6">
            If you have any questions about this Privacy Policy or how we handle your data, please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-gradient-to-r from-lust-violet to-seductive text-white px-8 py-3 rounded-lg font-semibold hover:shadow-glow-primary transition-all duration-300 transform hover:scale-[1.02] inline-block"
            >
              Contact Privacy Team
            </a>
            <a
              href="/account-settings"
              className="border border-seductive text-seductive px-8 py-3 rounded-lg font-semibold hover:bg-seductive hover:text-white transition-all duration-300 inline-block"
            >
              Manage Data Settings
            </a>
          </div>
        </div>

        {/* GDPR/CCPA Notice */}
        <div className="mt-8 bg-abyss-dark-900 border border-void-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Your Rights Under GDPR & CCPA</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-abyss-light-gray">
            <div>
              <h4 className="font-medium text-white mb-2">GDPR Rights (EU Residents):</h4>
              <ul className="space-y-1">
                <li>• Right to access your data</li>
                <li>• Right to rectification</li>
                <li>• Right to erasure</li>
                <li>• Right to data portability</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">CCPA Rights (CA Residents):</h4>
              <ul className="space-y-1">
                <li>• Right to know what data is collected</li>
                <li>• Right to delete personal information</li>
                <li>• Right to opt-out of sale</li>
                <li>• Right to non-discrimination</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
