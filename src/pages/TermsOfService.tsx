import React from 'react';
import { Scale, Shield, FileText, AlertTriangle } from 'lucide-react';

const TermsOfService: React.FC = () => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing or using VOID of DESIRE, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.`
    },
    {
      title: "2. Account Registration",
      content: `To access certain features of our service, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.`
    },
    {
      title: "3. User Conduct",
      content: `You agree not to use the service to upload, post, or transmit any content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable. You are solely responsible for your conduct and any data, text, information, usernames, graphics, images, photographs, profiles, audio, video, items, and links that you submit, post, and display on the service.`
    },
    {
      title: "4. Content and Intellectual Property",
      content: `The service and its original content, features, and functionality are and will remain the exclusive property of VOID of DESIRE and its licensors. The service is protected by copyright, trademark, and other laws. Users retain ownership of content they create but grant us a license to use, display, and distribute such content through our platform.`
    },
    {
      title: "5. Subscription and Payment Terms",
      content: `Subscription fees are billed in advance on a monthly or annual basis and are non-refundable except as expressly provided in these terms. You authorize us to charge your payment method for all fees. If payment is not received by the due date, your subscription may be suspended or terminated.`
    },
    {
      title: "6. Privacy and Data Protection",
      content: `Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service. By using our service, you agree to the collection and use of information in accordance with our Privacy Policy.`
    },
    {
      title: "7. Prohibited Uses",
      content: `You may not use our service for any unlawful purpose or to solicit others to engage in unlawful acts. You may not violate any local, state, national, or international law while using our service. This includes, but is not limited to, copyright infringement, harassment, or fraud.`
    },
    {
      title: "8. Termination",
      content: `We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms of Service.`
    },
    {
      title: "9. Disclaimer of Warranties",
      content: `The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions, and terms express or implied, statutory or otherwise.`
    },
    {
      title: "10. Limitation of Liability",
      content: `In no event shall VOID of DESIRE, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.`
    },
    {
      title: "11. Changes to Terms",
      content: `We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.`
    },
    {
      title: "12. Contact Information",
      content: `If you have any questions about these Terms of Service, please contact us at legal@voidofdesire.com or through our contact page.`
    }
  ];

  return (
    <div className="bg-abyss-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Scale className="h-16 w-16 text-seductive mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4 font-serif">
            Terms of Service
          </h1>
          <p className="text-lg text-abyss-light-gray mb-4">
            Last Updated: January 1, 2024
          </p>
          <div className="bg-seductive/10 border border-seductive/20 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-seductive mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-abyss-light-gray">
                Please read these terms carefully before using our service. By using VOID of DESIRE, you agree to be bound by these terms.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Content */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <FileText className="h-5 w-5 text-seductive mr-3" />
                {section.title}
              </h2>
              <p className="text-abyss-light-gray leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 bg-gradient-to-r from-seductive/10 to-lust-violet/10 border border-seductive/20 rounded-xl p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-seductive mr-3" />
            <h2 className="text-2xl font-bold text-white">
              Questions about these terms?
            </h2>
          </div>
          <p className="text-abyss-light-gray mb-6">
            If you have any questions or concerns about our Terms of Service, we're here to help.
          </p>
          <a
            href="/contact"
            className="bg-gradient-to-r from-lust-violet to-seductive text-white px-8 py-3 rounded-lg font-semibold hover:shadow-glow-primary transition-all duration-300 transform hover:scale-[1.02] inline-block"
          >
            Contact Legal Team
          </a>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
