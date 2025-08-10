import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, ChevronDown, ChevronUp, Clock, 
  AlertCircle, CheckCircle, User, Calendar, Tag,
  MoreVertical, Eye, MessageSquare, UserCheck
} from 'lucide-react';
import api from '../../utils/api';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    email: string;
  };
  currentAssignment?: {
    assignedTo: {
      id: string;
      username: string;
      displayName: string;
    };
  };
  responses: Array<{
    id: string;
    createdAt: string;
  }>;
}

interface FilterState {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Simple time ago function
const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
  return `${Math.floor(seconds / 31536000)} years ago`;
};

const TicketManagementTable: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'priority'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  useEffect(() => {
    fetchTickets();
  }, [filters, sortBy, sortOrder, page]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        sortBy,
        sortOrder,
        page,
        limit: 20,
      };
      const response = await api.get('/admin/support/tickets', { params });
      setTickets(response.data.tickets);
      setTotalPages(response.data.pagination.pages);
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      setError(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: 'createdAt' | 'updatedAt' | 'priority') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-warning-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-info-500" />;
      case 'waiting_customer':
        return <User className="h-4 w-4 text-warning-500" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      default:
        return null;
    }
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

  const handleSelectAll = () => {
    if (selectedTickets.length === tickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(tickets.map(t => t.id));
    }
  };

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  if (error) {
    return (
      <div className="card text-center py-10">
        <AlertCircle className="h-10 w-10 text-error-500 mx-auto mb-3" />
        <p className="text-text-primary">{error}</p>
        <button onClick={fetchTickets} className="btn-primary-sm mt-4">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Filters Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="form-input pl-10 w-80"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary-sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {selectedTickets.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">
                {selectedTickets.length} selected
              </span>
              <button className="btn-secondary-sm">Bulk Update</button>
            </div>
          )}
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="card p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="form-select"
              >
                <option value="">All</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_customer">Waiting for Customer</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select
                value={filters.priority || ''}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="form-select"
              >
                <option value="">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="form-label">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="form-select"
              >
                <option value="">All</option>
                <option value="account">Account</option>
                <option value="technical">Technical</option>
                <option value="payment">Payment</option>
                <option value="content">Content</option>
                <option value="trust_safety">Trust & Safety</option>
                <option value="feature_request">Feature Request</option>
                <option value="bug_report">Bug Report</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Date From</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-muted">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTickets.length === tickets.length && tickets.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-border-secondary"
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Ticket
                    {sortBy === 'createdAt' && (
                      sortOrder === 'DESC' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-text-secondary">Subject</th>
                <th className="px-4 py-3 text-left text-text-secondary">Customer</th>
                <th className="px-4 py-3 text-left text-text-secondary">Category</th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('priority')}
                    className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Priority
                    {sortBy === 'priority' && (
                      sortOrder === 'DESC' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-text-secondary">Status</th>
                <th className="px-4 py-3 text-left text-text-secondary">Assigned To</th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('updatedAt')}
                    className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Updated
                    {sortBy === 'updatedAt' && (
                      sortOrder === 'DESC' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center">
                    <div className="animate-pulse text-text-secondary">Loading tickets...</div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-text-secondary">
                    No tickets found
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-border-muted hover:bg-background-secondary transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedTickets.includes(ticket.id)}
                        onChange={() => handleSelectTicket(ticket.id)}
                        className="rounded border-border-secondary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-text-primary font-medium">{ticket.ticketNumber}</span>
                        {ticket.responses.length > 0 && (
                          <div className="flex items-center gap-1 text-text-tertiary text-sm">
                            <MessageSquare className="h-3 w-3" />
                            {ticket.responses.length}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-text-tertiary mt-1">
                        {getTimeAgo(ticket.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link 
                        to={`/admin/support/ticket/${ticket.id}`}
                        className="text-text-primary hover:text-text-accent transition-colors line-clamp-1"
                      >
                        {ticket.subject}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="text-text-primary">{ticket.user.displayName || ticket.user.username}</div>
                        <div className="text-text-tertiary text-xs">{ticket.user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-background-tertiary text-text-secondary">
                        <Tag className="h-3 w-3" />
                        {getCategoryLabel(ticket.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium text-sm ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <span className="text-sm text-text-secondary">
                          {ticket.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {ticket.currentAssignment ? (
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-text-tertiary" />
                          <span className="text-sm text-text-secondary">
                            {ticket.currentAssignment.assignedTo.displayName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-text-tertiary">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-tertiary">
                      {getTimeAgo(ticket.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/support/ticket/${ticket.id}`}
                          className="p-1 hover:bg-background-tertiary rounded transition-colors"
                          title="View Ticket"
                        >
                          <Eye className="h-4 w-4 text-text-secondary hover:text-text-primary" />
                        </Link>
                        <button
                          className="p-1 hover:bg-background-tertiary rounded transition-colors"
                          title="More Actions"
                        >
                          <MoreVertical className="h-4 w-4 text-text-secondary hover:text-text-primary" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border-muted flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn-secondary-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-text-secondary">
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
      </div>
    </div>
  );
};

export default TicketManagementTable;