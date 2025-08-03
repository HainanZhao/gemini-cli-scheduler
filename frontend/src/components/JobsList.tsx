
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Job {
  id: number;
  name: string;
  cron_schedule: string;
  prompt: string;
  is_active: boolean;
}

interface JobsListProps {
  refreshTrigger?: number;
  onJobsChange?: () => void;
}

const JobsList: React.FC<JobsListProps> = ({ refreshTrigger, onJobsChange }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs');
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [refreshTrigger]);

  const handleToggleActive = async (job: Job) => {
    try {
      await axios.put(`/api/jobs/${job.id}`, {
        is_active: !job.is_active
      });
      fetchJobs();
      if (onJobsChange) onJobsChange();
    } catch (error) {
      console.error('Error updating job:', error);
      setError('Failed to update job');
    }
  };

  const handleDelete = async (jobId: number) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/jobs/${jobId}`);
      fetchJobs();
      if (onJobsChange) onJobsChange();
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job');
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob({ ...job });
  };

  const handleSaveEdit = async () => {
    if (!editingJob) return;
    
    try {
      await axios.put(`/api/jobs/${editingJob.id}`, {
        name: editingJob.name,
        cron_schedule: editingJob.cron_schedule,
        prompt: editingJob.prompt,
        is_active: editingJob.is_active
      });
      setEditingJob(null);
      fetchJobs();
      if (onJobsChange) onJobsChange();
    } catch (error) {
      console.error('Error updating job:', error);
      setError('Failed to update job');
    }
  };

  return (
    <div style={{ margin: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Jobs List</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      {jobs.length === 0 ? (
        <p>No jobs created yet.</p>
      ) : (
        <div>
          {jobs.map((job) => (
            <div key={job.id} style={{ 
              border: '1px solid #eee', 
              padding: '15px', 
              marginBottom: '10px', 
              borderRadius: '4px',
              backgroundColor: job.is_active ? '#f8f9fa' : '#e9ecef'
            }}>
              {editingJob?.id === job.id ? (
                <div>
                  <input
                    value={editingJob.name}
                    onChange={(e) => setEditingJob({...editingJob, name: e.target.value})}
                    style={{ width: '100%', marginBottom: '5px', padding: '5px' }}
                  />
                  <input
                    value={editingJob.cron_schedule}
                    onChange={(e) => setEditingJob({...editingJob, cron_schedule: e.target.value})}
                    style={{ width: '100%', marginBottom: '5px', padding: '5px' }}
                  />
                  <textarea
                    value={editingJob.prompt}
                    onChange={(e) => setEditingJob({...editingJob, prompt: e.target.value})}
                    rows={3}
                    style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
                  />
                  <button onClick={handleSaveEdit} style={{ marginRight: '10px', padding: '5px 10px' }}>
                    Save
                  </button>
                  <button onClick={() => setEditingJob(null)} style={{ padding: '5px 10px' }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <h3>{job.name} {job.is_active ? '✓' : '✗'}</h3>
                  <p><strong>Schedule:</strong> {job.cron_schedule}</p>
                  <p><strong>Prompt:</strong> {job.prompt}</p>
                  <div style={{ marginTop: '10px' }}>
                    <button 
                      onClick={() => handleToggleActive(job)}
                      style={{ 
                        marginRight: '10px', 
                        padding: '5px 10px',
                        backgroundColor: job.is_active ? '#dc3545' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px'
                      }}
                    >
                      {job.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => handleEdit(job)}
                      style={{ 
                        marginRight: '10px', 
                        padding: '5px 10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px'
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(job.id)}
                      style={{ 
                        padding: '5px 10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsList;
