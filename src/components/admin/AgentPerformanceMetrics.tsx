import React, { useState } from 'react';
import {
  User, Users, Clock, TrendingUp, Star, Activity,
  CheckCircle, AlertCircle, Filter, Download
} from 'lucide-react';

interface AgentStats {
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
}

interface AgentPerformanceMetricsProps {
  agents: AgentStats[];
}

const AgentPerformanceMetrics: React.FC<AgentPerformanceMetricsProps> = ({ agents }) => {
  const [sortBy, setSortBy] = useState<'tickets' | 'response' | 'resolution' | 'satisfaction'>('tickets');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getPerformanceColor = (value: number, metric: 'response' | 'resolution' | 'satisfaction') => {
    if (metric === 'satisfaction') {
      if (value >= 4.5) return 'text-success-500';
      if (value >= 3.5) return 'text-warning-500';
      return 'text-error-500';
    } else {
      // For response/resolution time, lower is better
      if (value <= 30) return 'text-success-500';
      if (value <= 60) return 'text-warning-500';
      return 'text-error-500';
    }
  };

  const sortedAgents = [...agents]
    .filter(agent => !showOnlyAvailable || agent.isAvailable)
    .sort((a, b) => {
      switch (sortBy) {
        case 'tickets':
          return b.totalTicketsHandled - a.totalTicketsHandled;
        case 'response':
          return a.avgResponseTime - b.avgResponseTime;
        case 'resolution':
          return a.avgResolutionTime - b.avgResolutionTime;
        case 'satisfaction':
          return b.avgSatisfaction - a.avgSatisfaction;
        default:
          return 0;
      }
    });

  const getTopPerformer = () => {
    if (agents.length === 0) return null;
    return agents.reduce((best, agent) => {
      const bestScore = best.avgSatisfaction / best.avgResponseTime;
      const agentScore = agent.avgSatisfaction / agent.avgResponseTime;
      return agentScore > bestScore ? agent : best;
    });
  };

  const topPerformer = getTopPerformer();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-text-primary">
          Agent Performance Metrics
        </h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={showOnlyAvailable}
              onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              className="rounded border-border-secondary"
            />
            Show only available
          </label>
          <button className="btn-secondary-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Top Performer Highlight */}
      {topPerformer && (
        <div className="card-glass p-6 mb-6 bg-gradient-to-r from-void-accent/10 to-seductive/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-warning-500/20 rounded-lg">
                  <Star className="h-6 w-6 text-warning-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-text-primary">
                    Top Performer
                  </h4>
                  <p className="text-text-secondary">
                    {topPerformer.user.displayName}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {topPerformer.totalTicketsHandled}
                </div>
                <div className="text-text-tertiary">Tickets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success-500">
                  {formatTime(topPerformer.avgResponseTime)}
                </div>
                <div className="text-text-tertiary">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-500">
                  {topPerformer.avgSatisfaction.toFixed(1)}/5
                </div>
                <div className="text-text-tertiary">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-text-secondary">Sort by:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('tickets')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              sortBy === 'tickets' 
                ? 'bg-void-accent text-white' 
                : 'bg-background-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            Tickets Handled
          </button>
          <button
            onClick={() => setSortBy('response')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              sortBy === 'response' 
                ? 'bg-void-accent text-white' 
                : 'bg-background-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            Response Time
          </button>
          <button
            onClick={() => setSortBy('resolution')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              sortBy === 'resolution' 
                ? 'bg-void-accent text-white' 
                : 'bg-background-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            Resolution Time
          </button>
          <button
            onClick={() => setSortBy('satisfaction')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              sortBy === 'satisfaction' 
                ? 'bg-void-accent text-white' 
                : 'bg-background-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            Satisfaction
          </button>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedAgents.map((agent) => (
          <div key={agent.user.id} className="card hover:border-border-primary transition-all">
            {/* Agent Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-background-tertiary rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-text-secondary" />
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">
                    {agent.user.displayName}
                  </h4>
                  <p className="text-sm text-text-tertiary">
                    @{agent.user.username}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                agent.isAvailable ? 'text-success-500' : 'text-text-tertiary'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  agent.isAvailable ? 'bg-success-500' : 'bg-text-tertiary'
                }`} />
                {agent.isAvailable ? 'Available' : 'Offline'}
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm">Tickets Handled</span>
                </div>
                <span className="font-semibold text-text-primary">
                  {agent.totalTicketsHandled}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Avg Response</span>
                </div>
                <span className={`font-semibold ${getPerformanceColor(agent.avgResponseTime, 'response')}`}>
                  {formatTime(agent.avgResponseTime)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-secondary">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Avg Resolution</span>
                </div>
                <span className={`font-semibold ${getPerformanceColor(agent.avgResolutionTime, 'resolution')}`}>
                  {formatTime(agent.avgResolutionTime)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Star className="h-4 w-4" />
                  <span className="text-sm">Satisfaction</span>
                </div>
                <span className={`font-semibold ${getPerformanceColor(agent.avgSatisfaction, 'satisfaction')}`}>
                  {agent.avgSatisfaction.toFixed(1)}/5
                </span>
              </div>
            </div>

            {/* Performance Bar */}
            <div className="mt-4 pt-4 border-t border-border-muted">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-text-secondary">Performance Score</span>
                <span className="text-text-primary font-medium">
                  {Math.round((agent.avgSatisfaction / 5) * 100)}%
                </span>
              </div>
              <div className="w-full bg-background-tertiary rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-void-accent to-seductive rounded-full transition-all duration-500"
                  style={{ width: `${(agent.avgSatisfaction / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 card-glass p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">
          Team Overview
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-text-accent" />
              <span className="text-sm text-text-secondary">Total Agents</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{agents.length}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-text-accent" />
              <span className="text-sm text-text-secondary">Available Now</span>
            </div>
            <p className="text-2xl font-bold text-success-500">
              {agents.filter(a => a.isAvailable).length}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-text-accent" />
              <span className="text-sm text-text-secondary">Total Tickets</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {agents.reduce((sum, agent) => sum + agent.totalTicketsHandled, 0)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-text-accent" />
              <span className="text-sm text-text-secondary">Team Avg Rating</span>
            </div>
            <p className="text-2xl font-bold text-warning-500">
              {(agents.reduce((sum, agent) => sum + agent.avgSatisfaction, 0) / agents.length).toFixed(1)}/5
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPerformanceMetrics;