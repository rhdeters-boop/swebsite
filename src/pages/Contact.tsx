import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, Clock, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Contact form submitted:', formData);
  };

  const contactMethods = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Live Chat",
      description: "Chat with our support team",
      detail: "Available 24/7",
      action: "Start Chat"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Support",
      description: "Get help via email",
      detail: "support@voidofdesire.com",
      action: "Send Email"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone Support",
      description: "Speak with our team",
      detail: "+1 (555) 123-4567",
      action: "Call Now"
    }
  ];

  return (
    <div className="bg-abyss-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <MessageCircle className="h-16 w-16 text-seductive mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4 font-serif">
            Contact Support
          </h1>
          <p className="text-xl text-abyss-light-gray">
            We're here to help you with any questions or concerns
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-white font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-abyss-dark-800 border border-void-500/30 rounded-lg text-white focus:ring-2 focus:ring-seductive focus:border-seductive"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-white font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-abyss-dark-800 border border-void-500/30 rounded-lg text-white focus:ring-2 focus:ring-seductive focus:border-seductive"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-white font-medium mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-abyss-dark-800 border border-void-500/30 rounded-lg text-white focus:ring-2 focus:ring-seductive focus:border-seductive"
                >
                  <option value="">Select a topic</option>
                  <option value="account">Account Issues</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="technical">Technical Support</option>
                  <option value="content">Content Questions</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-white font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-abyss-dark-800 border border-void-500/30 rounded-lg text-white focus:ring-2 focus:ring-seductive focus:border-seductive resize-none"
                  placeholder="Describe your issue or question..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-lust-violet to-seductive text-white px-6 py-3 rounded-lg font-semibold hover:shadow-glow-primary transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
              >
                <Send className="h-5 w-5 mr-2" />
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Methods & Info */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Other ways to reach us</h2>
              <div className="space-y-4">
                {contactMethods.map((method, index) => (
                  <div key={index} className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-6 hover:border-seductive/50 transition-colors duration-200">
                    <div className="flex items-start">
                      <div className="p-3 bg-seductive/10 rounded-lg text-seductive mr-4">
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{method.title}</h3>
                        <p className="text-abyss-light-gray text-sm mb-2">{method.description}</p>
                        <p className="text-seductive font-medium mb-3">{method.detail}</p>
                        <button className="text-sm text-seductive hover:text-white transition-colors duration-200 font-medium">
                          {method.action} →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-abyss-dark-900 border border-void-500/30 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-seductive mr-3" />
                <h3 className="text-lg font-semibold text-white">Support Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-abyss-light-gray">Monday - Friday</span>
                  <span className="text-white">9:00 AM - 6:00 PM PST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-abyss-light-gray">Saturday</span>
                  <span className="text-white">10:00 AM - 4:00 PM PST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-abyss-light-gray">Sunday</span>
                  <span className="text-white">Closed</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-seductive/10 rounded-lg">
                <p className="text-xs text-seductive">
                  Live chat is available 24/7 for urgent issues
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
