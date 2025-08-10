import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, Clock, CheckCircle, AlertCircle, 
  User, Star, Calendar, Tag, MessageSquare, Paperclip,
  XCircle, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

interface TicketResponse {
  id: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  attachments?: string[];
  user: {
    id: string;
    username: string;
    displayName: string;
    profilePicture?: string;
    supportRole?: string;
  };
}

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  satisfaction?: number;
  user: {
    id: string;
    username: string;
    displayName: string;
    profilePicture?: string;
  };
  responses: TicketResponse[];
  currentAssignment?: {
    assignedTo: {
      id: string;
      username: string;
      displayName: string;
    };
  };
}

const TicketDetail: React.FC = () => {
  const { ticketNumber } = useParams<{ ticketNumber: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (ticketNumber) {
      fetchTicket();
    }
  }, [ticketNumber]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.responses]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/support/tickets/${ticketNumber}`);
      setTicket(response.data.ticket);
      
      // Show rating option if ticket is resolved/closed and not yet rated
      if (['resolved', 'closed'].includes(response.data.ticket.status) && 
          !response.data.ticket.satisfaction) {
        setShowRating(true);
      }
    } catch (err: any) {
      console.error('Error fetching ticket:', err);
      setError(err.response?.data?.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!responseText.trim() || !ticket) return;
    
    setIsSubmitting(true);
    try {
      await api.post(`/support/tickets/${ticketNumber}/responses`, {
        message: responseText,
        attachments: [] // TODO: Handle file uploads
      });
      
      setResponseText('');
      await fetchTicket(); // Refresh ticket data
    } catch (err: any) {
      console.error('Error submitting response:', err);
      alert(err.response?.data?.message || 'Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRating = async (value: number) => {
    if (!ticket) return;
    
    try {
      await api.post(`/support/tickets/${ticketNumber}/satisfaction`, {
        rating: value
      });
      
      setRating(value);
      setShowRating(false);
      await fetchTicket(); // Refresh ticket data
    } catch (err: any) {
      console.error('Error submitting rating:', err);
      alert(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-5 w-5 text-warning-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-info-500" />;
      case 'waiting_customer':
        return <User className="h-5 w-5 text-warning-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'closed':
        return <XCircle className="h-5 w-5 text-text-tertiary" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      account: 'Account',
      technical: 'Technical',
      payment: 'Payment',
      content: 'Content',
      trust_safety: 'Trust & Safety',
      feature_request: 'Feature Request',
      bug_report: 'Bug Report',
      other: 'Other'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="bg-background-primary min-h-screen py-12 px-4">
        <div className="container-app mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-background-secondary rounded w-1/3 mb-8"></div>
            <div className="h-64 bg-background-secondary rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-background-primary min-h-screen py-12 px-4">
        <div className="container-app mx-auto">
          <div className="card text-center py-10">
            <AlertCircle className="h-10 w-10 text-error-500 mx-auto mb-3" />
            <p className="text-text-primary">{error || 'Ticket not found'}</p>
            <Link to="/my-tickets" className="btn-primary-sm mt-4">
              Back to My Tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isTicketClosed = ['resolved', 'closed'].includes(ticket.status);

  return (
    <div className="bg-background-primary min-h-screen py-12 px-4">
      <div className="container-app mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/my-tickets"
            className="inline-flex items-center text-text-secondary hover:text-text-accent transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Tickets
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2 font-serif">
                {ticket.subject}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-text-tertiary">#{ticket.ticketNumber}</span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(ticket.status)}
                  <span className="text-text-secondary">
                    {ticket.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-text-tertiary">
                  <Tag className="h-4 w-4" />
                  {getCategoryLabel(ticket.category)}
                </div>
              </div>
            </div>
            {ticket.satisfaction && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < ticket.satisfaction!
                        ? 'fill-warning-500 text-warning-500'
                        : 'text-text-muted'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Conversation */}
          <div className="lg:col-span-2">
            <div className="card mb-6">
              {/* Original Message */}
              <div className="p-6 border-b border-border-muted">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-background-tertiary rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-text-secondary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="font-medium text-text-primary">
                        {ticket.user.displayName || ticket.user.username}
                      </h3>
                      <span className="text-sm text-text-tertiary">
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>
                    <div className="text-text-secondary whitespace-pre-wrap">
                      {ticket.description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Responses */}
              <div className="divide-y divide-border-muted">
                {ticket.responses.map((response) => (
                  <div key={response.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        response.user.supportRole 
                          ? 'bg-text-accent/10' 
                          : 'bg-background-tertiary'
                      }`}>
                        {response.user.supportRole ? (
                          <Shield className="h-5 w-5 text-text-accent" />
                        ) : (
                          <User className="h-5 w-5 text-text-secondary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-text-primary">
                              {response.user.displayName || response.user.username}
                            </h3>
                            {response.user.supportRole && (
                              <span className="text-xs px-2 py-0.5 bg-text-accent/10 text-text-accent rounded-full">
                                Support Team
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-text-tertiary">
                            {formatDate(response.createdAt)}
                          </span>
                        </div>
                        <div className="text-text-secondary whitespace-pre-wrap">
                          {response.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Form */}
            {!isTicketClosed ? (
              <form onSubmit={handleSubmitResponse} className="card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Add a Response
                </h3>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your message here..."
                  className="form-textarea min-h-[120px] mb-4"
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="text-text-secondary hover:text-text-primary transition-colors"
                    title="Attach files"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={!responseText.trim() || isSubmitting}
                    className="btn-primary"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Response
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="card p-6 text-center">
                <p className="text-text-secondary">
                  This ticket has been {ticket.status}. You can no longer add responses.
                </p>
                {showRating && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">
                      How was your experience?
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => handleRating(value)}
                          onMouseEnter={() => setHoverRating(value)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              value <= (hoverRating || rating)
                                ? 'fill-warning-500 text-warning-500'
                                : 'text-text-muted'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-text-tertiary">
                      Your feedback helps us improve our support
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Ticket Information
              </h3>
              
              <div>
                <p className="text-sm text-text-tertiary mb-1">Created</p>
                <p className="text-text-primary">{formatDate(ticket.createdAt)}</p>
              </div>
              
              <div>
                <p className="text-sm text-text-tertiary mb-1">Last Updated</p>
                <p className="text-text-primary">{formatDate(ticket.updatedAt)}</p>
              </div>
              
              <div>
                <p className="text-sm text-text-tertiary mb-1">Priority</p>
                <p className={`font-medium ${
                  ticket.priority === 'urgent' ? 'text-error-600' :
                  ticket.priority === 'high' ? 'text-error-500' :
                  ticket.priority === 'medium' ? 'text-warning-500' :
                  'text-info-500'
                }`}>
                  {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                </p>
              </div>
              
              {ticket.currentAssignment && (
                <div>
                  <p className="text-sm text-text-tertiary mb-1">Assigned To</p>
                  <p className="text-text-primary">
                    {ticket.currentAssignment.assignedTo.displayName}
                  </p>
                </div>
              )}
            </div>

            <div className="card-glass mt-6 p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                Need More Help?
              </h3>
              <p className="text-text-secondary mb-4">
                Browse our help articles for instant answers
              </p>
              <Link to="/help" className="btn-secondary-sm w-full justify-center">
                Visit Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;