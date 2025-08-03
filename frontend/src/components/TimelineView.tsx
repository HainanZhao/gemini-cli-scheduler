
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface JobRun {
  id: number;
  job_id: number;
  job_name: string;
  status: 'running' | 'success' | 'failure';
  output: string;
  start_time: string;
  end_time: string | null;
}

interface TimelineViewProps {
  refreshTrigger?: number;
}

const TimelineView: React.FC<TimelineViewProps> = ({ refreshTrigger }) => {
  const [jobRuns, setJobRuns] = useState<JobRun[]>([]);
  const [selectedJobRun, setSelectedJobRun] = useState<JobRun | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchJobRuns = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/job-runs');
      setJobRuns(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching job runs:', error);
      setError('Failed to fetch job runs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobRuns();
  }, [refreshTrigger]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': 
        return { class: 'badge-success', icon: 'icon-success', text: 'Success' };
      case 'failure': 
        return { class: 'badge-error', icon: 'icon-error', text: 'Failed' };
      case 'running': 
        return { class: 'badge-warning', icon: 'icon-clock', text: 'Running' };
      default: 
        return { class: 'badge-neutral', icon: 'icon-info', text: 'Unknown' };
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDuration = (start: string, end: string | null) => {
    if (!end) return 'Running...';
    const duration = new Date(end).getTime() - new Date(start).getTime();
    return `${Math.round(duration / 1000)}s`;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins > 0) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="loading">
            <div className="spinner"></div>
            Loading execution history...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {jobRuns.length === 0 ? (
        <div className="card">
          <div className="card-body text-center p-8">
            <div className="text-4xl mb-4">�</div>
            <h3 className="text-xl font-semibold mb-2">No Execution History</h3>
            <p className="text-secondary mb-6">
              Your scheduled jobs will appear here once they start running.
            </p>
            <div className="text-sm text-tertiary">
              Create and activate jobs to see their execution timeline.
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-secondary">
              Showing {jobRuns.length} job run{jobRuns.length !== 1 ? 's' : ''}
            </div>
            <button 
              onClick={fetchJobRuns}
              className="btn btn-sm btn-secondary"
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {jobRuns.map((run) => {
            const statusInfo = getStatusBadge(run.status);
            return (
              <div 
                key={run.id} 
                className="card cursor-pointer transition-all hover:shadow-md"
                onClick={() => setSelectedJobRun(run)}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">{statusInfo.icon}</span>
                        <h4 className="font-semibold text-lg">
                          {run.job_name || `Job ${run.job_id}`}
                        </h4>
                        <span className={`badge ${statusInfo.class}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-tertiary">Started:</span>
                          <div className="font-medium">
                            {formatTimeAgo(run.start_time)}
                          </div>
                        </div>
                        
                        {run.end_time && (
                          <div>
                            <span className="text-tertiary">Duration:</span>
                            <div className="font-medium">
                              {getDuration(run.start_time, run.end_time)}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <span className="text-tertiary">Job ID:</span>
                          <div className="font-medium font-mono">
                            #{run.job_id}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-tertiary">Run ID:</span>
                          <div className="font-medium font-mono">
                            #{run.id}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-tertiary">
                        {formatDateTime(run.start_time)}
                      </div>
                    </div>
                    
                    <div className="text-xs text-tertiary ml-4">
                      Click for details →
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Run Details Modal */}
      {selectedJobRun && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-modal p-4">
          <div className="bg-primary rounded-xl max-w-4xl max-h-[90vh] overflow-hidden shadow-xl w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-light bg-secondary">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{getStatusBadge(selectedJobRun.status).icon}</span>
                  <h3 className="text-xl font-semibold">
                    {selectedJobRun.job_name || `Job ${selectedJobRun.job_id}`}
                  </h3>
                  <span className={`badge ${getStatusBadge(selectedJobRun.status).class}`}>
                    {getStatusBadge(selectedJobRun.status).text}
                  </span>
                </div>
                <p className="text-sm text-secondary">
                  Run #{selectedJobRun.id} • {formatDateTime(selectedJobRun.start_time)}
                </p>
              </div>
              <button 
                onClick={() => setSelectedJobRun(null)}
                className="btn btn-sm btn-secondary rounded-full w-8 h-8 p-0 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
              {/* Status Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card">
                  <div className="card-body text-center">
                    <div className="text-xs text-tertiary mb-1">Status</div>
                    <div className={`badge ${getStatusBadge(selectedJobRun.status).class}`}>
                      {getStatusBadge(selectedJobRun.status).text}
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="card-body text-center">
                    <div className="text-xs text-tertiary mb-1">Started</div>
                    <div className="text-sm font-medium">
                      {formatTimeAgo(selectedJobRun.start_time)}
                    </div>
                  </div>
                </div>
                
                {selectedJobRun.end_time && (
                  <>
                    <div className="card">
                      <div className="card-body text-center">
                        <div className="text-xs text-tertiary mb-1">Completed</div>
                        <div className="text-sm font-medium">
                          {formatTimeAgo(selectedJobRun.end_time)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="card">
                      <div className="card-body text-center">
                        <div className="text-xs text-tertiary mb-1">Duration</div>
                        <div className="text-sm font-medium">
                          {getDuration(selectedJobRun.start_time, selectedJobRun.end_time)}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Output Section */}
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span>📄</span>
                  AI Response Output
                </h4>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-auto max-h-96">
                  {selectedJobRun.output ? (
                    <pre className="whitespace-pre-wrap leading-relaxed">
                      {selectedJobRun.output}
                    </pre>
                  ) : (
                    <div className="text-gray-400 italic text-center py-8">
                      No output was captured for this job run.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineView;
