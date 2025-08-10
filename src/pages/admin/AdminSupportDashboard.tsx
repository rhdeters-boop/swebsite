import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TicketIcon, Users, Clock, TrendingUp, AlertCircle, 
  CheckCircle, XCircle, MessageSquare, Star, BarChart3,
  Activity, Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import TicketManagementTable from '../../components/admin/TicketManagementTable';
import AgentPerformanceMetrics from '../../components/admin/AgentPerformanceMetrics';

interface DashboardStats {
  overview: {
    openTickets: number;
    ticketsToday: number;
    ticketsThisWeek: number;
    avgResponseTime: number;
    avgResolutionTime: number;
    avgSatisfaction: number;
    totalRatings: number;
  };
  categoryDistribution: Array<{
    category: string;
    count: number;
  }>;
  agentStats?: Array<{
    user: {
      id: string;
      username: string;
      displayName: string;
    };
    totalTicketsHandled: number;
    avgResponseTime: number;
    avgResolutionTime: number;
    avgSatisfaction: number;
    isAvailable: boolean;
  }>;
}

const AdminSupportDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'agents'>('overview');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/support/stats');
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
      <div className="bg-background-primary min-h-screen py-8 px-4">
        <div className="container-wide mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-background-secondary rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-background-secondary rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background-primary min-h-screen py-8 px-4">
        <div className="container-wide mx-auto">
          <div className="card text-center py-10">
            <AlertCircle className="h-10 w-10 text-error-500 mx-auto mb-3" />
            <p className="text-text-primary">{error}</p>
            <button onClick={fetchDashboardStats} className="btn-primary-sm mt-4">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-background-primary min-h-screen">
      {/* Header */}
      <div className="bg-background-secondary border-b border-border-muted">
        <div className="container-wide mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary font-serif">
                Support Dashboard
              </h1>
              <p className="text-text-secondary mt-1">
                Monitor and manage customer support operations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/admin/support/settings" className="btn-secondary-sm">
                <Filter className="h-4 w-4 mr-2" />
                Settings
              </Link>
              <Link to="/contact" className="btn-primary-sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Test Ticket
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-background-secondary border-b border-border-muted">
        <div className="container-wide mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-text-accent text-text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'tickets'
                  ? 'border-text-accent text-text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Tickets
            </button>
            {user?.supportRole === 'support_admin' && (
              <button
                onClick={() => setActiveTab('agents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'agents'
                    ? 'border-text-accent text-text-accent'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                Agents
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container-wide mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Open Tickets */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-warning-500/10 rounded-lg">
                    <TicketIcon className="h-6 w-6 text-warning-500" />
                  </div>
                  <span className="text-sm text-text-tertiary">Active</span>
                </div>
                <h3 className="text-2xl font-bold text-text-primary">
                  {stats.overview.openTickets}
                </h3>
                <p className="text-sm text-text-secondary mt-1">Open Tickets</p>
              </div>

              {/* Today's Tickets */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-info-500/10 rounded-lg">
                    <Activity className="h-6 w-6 text-info-500" />
                  </div>
                  <span className="text-sm text-text-tertiary">Today</span>
                </div>
                <h3 className="text-2xl font-bold text-text-primary">
                  {stats.overview.ticketsToday}
                </h3>
                <p className="text-sm text-text-secondary mt-1">New Today</p>
              </div>

              {/* Response Time */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-void-accent/10 rounded-lg">
                    <Clock className="h-6 w-6 text-void-accent" />
                  </div>
                  <span className="text-sm text-text-tertiary">Avg</span>
                </div>
                <h3 className="text-2xl font-bold text-text-primary">
                  {formatTime(stats.overview.avgResponseTime)}
                </h3>
                <p className="text-sm text-text-secondary mt-1">Response Time</p>
              </div>

              {/* Satisfaction */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-success-500/10 rounded-lg">
                    <Star className="h-6 w-6 text-success-500" />
                  </div>
                  <span className="text-sm text-text-tertiary">
                    {stats.overview.totalRatings} ratings
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-text-primary">
                  {stats.overview.avgSatisfaction.toFixed(1)}/5
                </h3>
                <p className="text-sm text-text-secondary mt-1">Satisfaction</p>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Weekly Activity */}
              <div className="card">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-text-accent" />
                  Weekly Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Tickets This Week</span>
                    <span className="text-text-primary font-semibold">
                      {stats.overview.ticketsThisWeek}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Avg Resolution Time</span>
                    <span className="text-text-primary font-semibold">
                      {formatTime(stats.overview.avgResolutionTime)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Distribution */}
              <div className="card">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-text-accent" />
                  Ticket Categories (This Month)
                </h3>
                <div className="space-y-2">
                  {stats.categoryDistribution.slice(0, 5).map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="text-text-secondary text-sm">
                        {getCategoryLabel(item.category)}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-background-tertiary rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-text-accent rounded-full"
                            style={{ 
                              width: `${(item.count / Math.max(...stats.categoryDistribution.map(c => c.count))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-text-primary font-medium text-sm w-8 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-glass p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/admin/support/tickets?status=open" className="btn-secondary text-center">
                  View Open Tickets
                </Link>
                <Link to="/admin/support/tickets?priority=urgent" className="btn-secondary text-center">
                  Urgent Tickets
                </Link>
                <Link to="/admin/support/canned-responses" className="btn-secondary text-center">
                  Response Templates
                </Link>
                <Link to="/admin/support/reports" className="btn-secondary text-center">
                  Generate Reports
                </Link>
              </div>
            </div>
          </>
        )}

        {activeTab === 'tickets' && (
          <TicketManagementTable />
        )}

        {activeTab === 'agents' && user?.supportRole === 'support_admin' && stats.agentStats && (
          <AgentPerformanceMetrics agents={stats.agentStats} />
        )}
      </div>
    </div>
  );
};

export default AdminSupportDashboard;