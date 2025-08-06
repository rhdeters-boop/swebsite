import React from 'react';
import { CreditCard, RefreshCw, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

const RefundPolicy: React.FC = () => {
  const refundScenarios = [
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Eligible for Full Refund",
      scenarios: [
        "Service downtime exceeding 48 hours",
        "Unauthorized charges on your account",
        "Technical issues preventing access for more than 7 days",
        "Creator content violations resulting in account suspension"
      ],
      color: "text-green-400"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Eligible for Partial Refund",
      scenarios: [
        "Cancellation within 7 days of subscription",
        "Downgrade of subscription tier mid-cycle",
        "Service interruptions between 24-48 hours",
        "Creator account termination mid-subscription"
      ],
      color: "text-yellow-400"
    },
    {
      icon: <XCircle className="h-6 w-6" />,
      title: "Not Eligible for Refund",
      scenarios: [
        "Subscription used for more than 14 days",
        "Voluntary account deletion",
        "Policy violations resulting in termination",
        "Change of mind after content consumption"
      ],
      color: "text-red-400"
    }
  ];

  const refundProcess = [
    {
      step: 1,
      title: "Submit Request",
      description: "Contact our support team with your refund request and reason"
    },
    {
      step: 2,
      title: "Review Process",
      description: "We'll review your request within 3-5 business days"
    },
    {
      step: 3,
      title: "Decision Notification",
      description: "You'll receive an email with our decision and next steps"
    },
    {
      step: 4,
      title: "Refund Processing",
      description: "Approved refunds are processed within 7-10 business days"
    }
  ];

  return (
    <div className="bg-abyss-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <RefreshCw className="h-16 w-16 text-seductive mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4 font-serif">
            Refund Policy
          </h1>
          <p className="text-lg text-abyss-light-gray mb-4">
            Last Updated: January 1, 2024
          </p>
          <div className="bg-seductive/10 border border-seductive/20 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-seductive mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-abyss-light-gray">
                We want you to be satisfied with our service. This policy outlines when refunds are available and how to request them.
              </p>
            </div>
          </div>
        </div>

        {/* General Policy */}
        <div className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-8 mb-12">
          <div className="flex items-center mb-6">
            <CreditCard className="h-8 w-8 text-seductive mr-4" />
            <h2 className="text-2xl font-bold text-white">General Refund Policy</h2>
          </div>
          <div className="space-y-4 text-abyss-light-gray">
            <p>
              At VOID of DESIRE, we strive to provide the best possible experience for our users. While our subscriptions are generally non-refundable due to the digital nature of our content, we understand that exceptional circumstances may warrant a refund.
            </p>
            <p>
              All refund requests are reviewed on a case-by-case basis and must be submitted within 30 days of the original purchase. Refunds, when approved, will be credited back to your original payment method.
            </p>
            <p className="bg-seductive/10 border-l-4 border-seductive p-4 rounded">
              <strong className="text-white">Important:</strong> Tips sent to creators are non-refundable as they are considered final transactions between users and creators.
            </p>
          </div>
        </div>

        {/* Refund Scenarios */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Refund Eligibility
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {refundScenarios.map((scenario, index) => (
              <div key={index} className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${scenario.color} bg-opacity-20 mr-3`}>
                    <div className={scenario.color}>
                      {scenario.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{scenario.title}</h3>
                </div>
                <ul className="space-y-2">
                  {scenario.scenarios.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-abyss-light-gray flex items-start">
                      <span className="w-2 h-2 bg-seductive rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Refund Process */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            How to Request a Refund
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {refundProcess.map((step, index) => (
              <div key={index} className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-6 relative">
                <div className="text-center">
                  <div className="w-12 h-12 bg-seductive rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-sm text-abyss-light-gray">{step.description}</p>
                </div>
                {index < refundProcess.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-seductive transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Special Circumstances */}
        <div className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-8 mb-12">
          <h2 className="text-xl font-bold text-white mb-6">Special Circumstances</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-seductive mb-3">Creator Account Issues</h3>
              <p className="text-sm text-abyss-light-gray mb-4">
                If a creator's account is suspended or terminated for policy violations, subscribers may be eligible for a prorated refund for the unused portion of their subscription.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-seductive mb-3">Technical Problems</h3>
              <p className="text-sm text-abyss-light-gray mb-4">
                Persistent technical issues that prevent you from accessing purchased content may qualify for a refund, depending on the duration and severity of the problem.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-seductive mb-3">Billing Errors</h3>
              <p className="text-sm text-abyss-light-gray mb-4">
                Duplicate charges, incorrect billing amounts, or unauthorized charges will be refunded in full once verified.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-seductive mb-3">Service Changes</h3>
              <p className="text-sm text-abyss-light-gray mb-4">
                Major changes to service features or creator content policies may qualify for refunds if they significantly impact your subscription value.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-seductive/10 to-lust-violet/10 border border-seductive/20 rounded-xl p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <RefreshCw className="h-8 w-8 text-seductive mr-3" />
            <h2 className="text-2xl font-bold text-white">
              Need to request a refund?
            </h2>
          </div>
          <p className="text-abyss-light-gray mb-6">
            Our support team is here to help you with your refund request. Please include your order details and reason for the refund.
          </p>
          <a
            href="/contact"
            className="bg-gradient-to-r from-lust-violet to-seductive text-white px-8 py-3 rounded-lg font-semibold hover:shadow-glow-primary transition-all duration-300 transform hover:scale-[1.02] inline-block"
          >
            Contact Support for Refund
          </a>
        </div>

        {/* Timeline Note */}
        <div className="mt-8 bg-abyss-dark-900 border border-void-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Clock className="h-5 w-5 text-seductive mr-2" />
            Processing Times
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-abyss-light-gray">
            <div>
              <h4 className="font-medium text-white mb-1">Review Period:</h4>
              <p>3-5 business days</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Processing Time:</h4>
              <p>7-10 business days</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Bank Processing:</h4>
              <p>2-5 business days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
