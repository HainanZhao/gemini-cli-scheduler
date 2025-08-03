
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

  const fetchJobRuns = async () => {
    try {
      const response = await axios.get('/api/job-runs');
      setJobRuns(response.data);
    } catch (error) {
      console.error('Error fetching job runs:', error);
      setError('Failed to fetch job runs');
    }
  };

  useEffect(() => {
    fetchJobRuns();
  }, [refreshTrigger]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#28a745';
      case 'failure': return '#dc3545';
      case 'running': return '#ffc107';
      default: return '#6c757d';
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

  return (
    <div style={{ margin: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Job Runs Timeline</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      {jobRuns.length === 0 ? (
        <p>No job runs yet.</p>
      ) : (
        <div>
          {jobRuns.map((run) => (
            <div 
              key={run.id} 
              style={{ 
                border: '1px solid #eee', 
                padding: '15px', 
                marginBottom: '10px', 
                borderRadius: '4px',
                borderLeft: `4px solid ${getStatusColor(run.status)}`,
                cursor: 'pointer',
                backgroundColor: '#f8f9fa'
              }}
              onClick={() => setSelectedJobRun(run)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>
                    {run.job_name || `Job ${run.job_id}`}
                  </h4>
                  <p style={{ margin: '0', color: '#666' }}>
                    Status: <span style={{ color: getStatusColor(run.status), fontWeight: 'bold' }}>
                      {run.status.toUpperCase()}
                    </span>
                  </p>
                  <p style={{ margin: '0', color: '#666', fontSize: '0.9em' }}>
                    Started: {formatDateTime(run.start_time)}
                  </p>
                  {run.end_time && (
                    <p style={{ margin: '0', color: '#666', fontSize: '0.9em' }}>
                      Duration: {getDuration(run.start_time, run.end_time)}
                    </p>
                  )}
                </div>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: getStatusColor(run.status) 
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Run Details Modal */}
      {selectedJobRun && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '80%',
            maxHeight: '80%',
            overflow: 'auto',
            minWidth: '600px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>
                Job Run Details - {selectedJobRun.job_name || `Job ${selectedJobRun.job_id}`}
              </h3>
              <button 
                onClick={() => setSelectedJobRun(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <p><strong>Status:</strong> <span style={{ color: getStatusColor(selectedJobRun.status) }}>
                {selectedJobRun.status.toUpperCase()}
              </span></p>
              <p><strong>Started:</strong> {formatDateTime(selectedJobRun.start_time)}</p>
              {selectedJobRun.end_time && (
                <>
                  <p><strong>Ended:</strong> {formatDateTime(selectedJobRun.end_time)}</p>
                  <p><strong>Duration:</strong> {getDuration(selectedJobRun.start_time, selectedJobRun.end_time)}</p>
                </>
              )}
            </div>
            
            <div>
              <h4>Output:</h4>
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                padding: '15px',
                fontFamily: 'monospace',
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
                maxHeight: '400px',
                overflow: 'auto'
              }}>
                {selectedJobRun.output || 'No output available'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineView;
