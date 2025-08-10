import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Filter, Clock, CheckCircle, 
  AlertCircle, MessageSquare, ChevronRight, User,
  Tag, Calendar, Star, XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  responses: Array<{
    id: string;
  }>;
  currentAssignment?: {
    assignedTo: {
      id: string;
      username: string;
      displayName: string;
    };
  };
  satisfaction?: number;
}

const MyTickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user?.id) {
      fetchTickets();
    }
  }, [user, statusFilter, page]);

  const fetchTickets = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 10,
      };
      
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      const response = await api.get(`/support/tickets/user/${user.id}`, { params });
      setTickets(response.data.tickets);
      setTotalPages(response.data.pagination.pages);
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      setError(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-warning-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-info-500" />;
      case 'waiting_customer':
        return <User className="h-4 w-4 text-warning-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-text-tertiary" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-info-500',
      medium: 'text-warning-500',
      high: 'text-error-500',
      urgent: 'text-error-600 font-bold',
    };
    return colors[priority as keyof typeof colors] || 'text-text-secondary';
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

  const filteredTickets = tickets.filter(ticket => 
    searchQuery === '' || 
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && page === 1) {
    return (
      <div className="bg-background-primary min-h-screen py-12 px-4">
        <div className="container-app mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-background-secondary rounded w-1/3 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-background-secondary rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-primary min-h-screen py-12 px-4">
      <div className="container-app mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2 font-serif">
              My Support Tickets
            </h1>
            <p className="text-text-secondary">
              Track and manage your support requests
            </p>
          </div>
          <Link to="/contact" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search by ticket number or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="form-select"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_customer">Waiting for You</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Error State */}
        {error && (
          <div className="card text-center py-10 mb-6">
            <AlertCircle className="h-10 w-10 text-error-500 mx-auto mb-3" />
            <p className="text-text-primary">{error}</p>
            <button onClick={fetchTickets} className="btn-primary-sm mt-4">
              Try Again
            </button>
          </div>
        )}

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="card text-center py-12">
            <MessageSquare className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {searchQuery ? 'No tickets found' : 'No support tickets yet'}
            </h3>
            <p className="text-text-secondary mb-6">
              {searchQuery 
                ? 'Try adjusting your search criteria'
                : 'When you submit a support request, it will appear here'
              }
            </p>
            {!searchQuery && (
              <Link to="/contact" className="btn-primary-sm">
                Submit Your First Ticket
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/ticket/${ticket.ticketNumber}`}
                className="card hover:border-border-primary transition-all duration-200 block group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-medium text-text-primary group-hover:text-text-accent transition-colors">
                            {ticket.subject}
                          </h3>
                          {ticket.satisfaction && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < ticket.satisfaction!
                                      ? 'fill-warning-500 text-warning-500'
                                      : 'text-text-muted'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-text-tertiary">
                          #{ticket.ticketNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <span className="text-sm font-medium text-text-secondary">
                          {getStatusLabel(ticket.status)}
                        </span>
                      </div>
                    </div>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-text-tertiary">
                        <Tag className="h-3 w-3" />
                        <span>{getCategoryLabel(ticket.category)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-text-tertiary">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(ticket.createdAt)}</span>
                      </div>
                      {ticket.currentAssignment && (
                        <div className="flex items-center gap-1 text-text-tertiary">
                          <User className="h-3 w-3" />
                          <span>Assigned to {ticket.currentAssignment.assignedTo.displayName}</span>
                        </div>
                      )}
                      {ticket.responses.length > 0 && (
                        <div className="flex items-center gap-1 text-text-tertiary">
                          <MessageSquare className="h-3 w-3" />
                          <span>{ticket.responses.length} responses</span>
                        </div>
                      )}
                      <div className={`text-sm ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                      </div>
                    </div>

                    {/* Last Updated */}
                    {ticket.updatedAt !== ticket.createdAt && (
                      <p className="text-xs text-text-tertiary mt-2">
                        Last updated: {formatDate(ticket.updatedAt)}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-tertiary group-hover:text-text-accent transition-colors ml-4 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn-secondary-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-text-secondary px-4">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="btn-secondary-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 card-glass p-6 text-center">
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Need Help?
          </h3>
          <p className="text-text-secondary mb-4">
            Check our Help Center for instant answers or submit a new ticket
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/help" className="btn-secondary-sm">
              Browse Help Center
            </Link>
            <Link to="/contact" className="btn-primary-sm">
              Submit New Ticket
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTickets;