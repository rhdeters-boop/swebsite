import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Send, Paperclip, AlertCircle, 
  CheckCircle, HelpCircle, Bug, DollarSign, 
  Shield, Lightbulb, MessageSquare, Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

interface FormData {
  category: string;
  subject: string;
  description: string;
  attachments: File[];
}

interface FormErrors {
  category?: string;
  subject?: string;
  description?: string;
}

const SubmitTicket: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    category: '',
    subject: '',
    description: '',
    attachments: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string>('');

  const categories = [
    { value: 'account', label: 'Account & Profile', icon: HelpCircle, description: 'Login issues, profile updates, settings' },
    { value: 'technical', label: 'Technical Support', icon: Bug, description: 'Site errors, performance issues, bugs' },
    { value: 'payment', label: 'Billing & Payments', icon: DollarSign, description: 'Subscription, refunds, payment methods' },
    { value: 'content', label: 'Content Issues', icon: Package, description: 'Missing content, playback problems' },
    { value: 'trust_safety', label: 'Trust & Safety', icon: Shield, description: 'Report violations, safety concerns' },
    { value: 'feature_request', label: 'Feature Request', icon: Lightbulb, description: 'Suggest new features or improvements' },
    { value: 'bug_report', label: 'Bug Report', icon: Bug, description: 'Report specific bugs or glitches' },
    { value: 'other', label: 'Other', icon: MessageSquare, description: 'General inquiries and other topics' },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length > 200) {
      newErrors.subject = 'Subject must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 5000) {
      newErrors.description = 'Description must be less than 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await api.post('/support/tickets', {
        category: formData.category,
        subject: formData.subject,
        description: formData.description,
        // TODO: Handle file uploads separately
        attachments: []
      });

      setSubmitSuccess(true);
      setTicketNumber(response.data.ticket.ticketNumber);
    } catch (error: any) {
      console.error('Error submitting ticket:', error);
      setSubmitError(error.response?.data?.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-background-primary min-h-screen py-12 px-4">
        <div className="container-content mx-auto">
          <div className="card max-w-2xl mx-auto text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-success-500/10 rounded-full mb-6">
              <CheckCircle className="h-8 w-8 text-success-500" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-4 font-serif">
              Ticket Submitted Successfully!
            </h1>
            <p className="text-lg text-text-secondary mb-2">
              Your ticket number is:
            </p>
            <p className="text-2xl font-mono text-text-accent mb-6">
              {ticketNumber}
            </p>
            <p className="text-text-secondary mb-8">
              We've sent a confirmation email to {user?.email}. Our support team will respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/my-tickets" className="btn-primary">
                View My Tickets
              </Link>
              <Link to="/help" className="btn-secondary">
                Back to Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-primary min-h-screen py-12 px-4">
      <div className="container-content mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/help"
            className="inline-flex items-center text-text-secondary hover:text-text-accent transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Link>
          <h1 className="text-3xl font-bold text-text-primary mb-4 font-serif">
            Submit a Support Ticket
          </h1>
          <p className="text-lg text-text-secondary">
            Need help? Submit a ticket and our support team will assist you.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-3xl">
          {/* Category Selection */}
          <div className="mb-8">
            <label className="form-label form-label-required">
              Select a Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: category.value })}
                    className={`card p-4 text-left transition-all ${
                      formData.category === category.value
                        ? 'border-text-accent bg-void-accent/10'
                        : 'hover:border-border-primary'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        formData.category === category.value
                          ? 'bg-text-accent/20 text-text-accent'
                          : 'bg-background-tertiary text-text-secondary'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-text-primary mb-1">
                          {category.label}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="form-error mt-2">{errors.category}</p>
            )}
          </div>

          {/* Subject */}
          <div className="mb-6">
            <label htmlFor="subject" className="form-label form-label-required">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief summary of your issue"
              className={`form-input ${errors.subject ? 'form-input-error' : ''}`}
              maxLength={200}
            />
            <div className="flex justify-between mt-1">
              {errors.subject ? (
                <p className="form-error">{errors.subject}</p>
              ) : (
                <p className="form-help">Provide a clear, concise subject</p>
              )}
              <span className="text-xs text-text-tertiary">
                {formData.subject.length}/200
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="form-label form-label-required">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide detailed information about your issue. Include any relevant order numbers, usernames, or error messages."
              className={`form-textarea min-h-[200px] ${errors.description ? 'form-input-error' : ''}`}
              maxLength={5000}
            />
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p className="form-error">{errors.description}</p>
              ) : (
                <p className="form-help">The more details you provide, the better we can help</p>
              )}
              <span className="text-xs text-text-tertiary">
                {formData.description.length}/5000
              </span>
            </div>
          </div>

          {/* Attachments */}
          <div className="mb-8">
            <label className="form-label">
              Attachments (Optional)
            </label>
            <div className="card border-dashed p-8 text-center">
              <Paperclip className="h-8 w-8 text-text-tertiary mx-auto mb-3" />
              <p className="text-text-secondary mb-2">
                Drag and drop files here or click to browse
              </p>
              <p className="text-sm text-text-tertiary">
                Supports images and PDFs up to 10MB each
              </p>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                className="hidden"
                id="file-upload"
                onChange={(e) => {
                  // TODO: Handle file uploads
                }}
              />
              <label htmlFor="file-upload" className="btn-secondary-sm mt-4 cursor-pointer">
                Choose Files
              </label>
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="alert alert-error mb-6">
              <AlertCircle className="h-5 w-5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              By submitting, you agree to our{' '}
              <Link to="/privacy" className="text-text-accent hover:text-lust-violet">
                Privacy Policy
              </Link>
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-12 card-glass p-6 max-w-3xl">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Before You Submit
          </h3>
          <ul className="space-y-3 text-text-secondary">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-success-500 flex-shrink-0 mt-0.5" />
              <span>Check our <Link to="/help" className="text-text-accent hover:text-lust-violet">Help Center</Link> for instant answers to common questions</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-success-500 flex-shrink-0 mt-0.5" />
              <span>Include specific details like error messages, URLs, or screenshots</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-success-500 flex-shrink-0 mt-0.5" />
              <span>Typical response time is within 24 hours during business days</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SubmitTicket;