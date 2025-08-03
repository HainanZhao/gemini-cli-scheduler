
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ScheduleSelector from './ScheduleSelector';

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
  onNavigateToCreate?: () => void;
}

const JobsList: React.FC<JobsListProps> = ({ refreshTrigger, onJobsChange, onNavigateToCreate }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const getScheduleDescription = (cronSchedule: string): string => {
    const scheduleMap: { [key: string]: string } = {
      '* * * * *': 'Every minute',
      '*/15 * * * *': 'Every 15 minutes',
      '*/30 * * * *': 'Every 30 minutes',
      '0 * * * *': 'Every hour',
      '0 */2 * * *': 'Every 2 hours',
      '0 */6 * * *': 'Every 6 hours',
      '0 9 * * *': 'Daily at 9:00 AM',
      '0 18 * * *': 'Daily at 6:00 PM',
      '0 9 * * 1-5': 'Weekdays at 9:00 AM',
      '0 10 * * 6,0': 'Weekends at 10:00 AM',
      '0 9 * * 1': 'Weekly (Monday 9:00 AM)',
      '0 9 1 * *': 'Monthly (1st at 9:00 AM)',
    };
    
    return scheduleMap[cronSchedule] || `Custom: ${cronSchedule}`;
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/jobs');
      setJobs(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="loading">
            <div className="spinner"></div>
            Loading jobs...
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
      
      {jobs.length === 0 ? (
        <div className="card fade-in">
          <div className="card-body text-center p-12">
            <div className="icon icon-schedule text-6xl mb-6 text-primary-300"></div>
            <h3 className="text-2xl font-semibold mb-3 text-primary">No Scheduled Jobs</h3>
            <p className="text-secondary mb-8 text-lg">
              You haven't created any scheduled AI jobs yet. Create your first job to start automating AI tasks with custom prompts and flexible scheduling.
            </p>
            <button 
              className="btn btn-primary btn-lg"
              onClick={onNavigateToCreate}
            >
              <span className="icon icon-add"></span>
              Create Your First Job
            </button>
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {jobs.map((job) => (
            <div key={job.id} className="card">
              {editingJob?.id === job.id ? (
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label required">Job Name</label>
                    <input
                      className="form-control"
                      value={editingJob.name}
                      onChange={(e) => setEditingJob({...editingJob, name: e.target.value})}
                      placeholder="Enter job name"
                    />
                  </div>
                  
                  <ScheduleSelector
                    value={editingJob.cron_schedule}
                    onChange={(cron: string) => setEditingJob({...editingJob, cron_schedule: cron})}
                  />
                  
                  <div className="form-group">
                    <label className="form-label required">AI Prompt</label>
                    <textarea
                      className="form-control"
                      value={editingJob.prompt}
                      onChange={(e) => setEditingJob({...editingJob, prompt: e.target.value})}
                      rows={4}
                      placeholder="Describe the task for the AI to perform..."
                    />
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={handleSaveEdit} 
                      className="btn btn-success"
                      disabled={!editingJob.name.trim() || !editingJob.prompt.trim()}
                    >
                      <span className="icon icon-save"></span>
                      Save Changes
                    </button>
                    <button onClick={() => setEditingJob(null)} className="btn btn-secondary">
                      <span className="icon icon-error"></span>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="card-header">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="card-title">{job.name}</h3>
                        <div className={`status-indicator ${job.is_active ? 'status-active' : 'status-inactive'}`}>
                          <span className={`icon ${job.is_active ? 'icon-success' : 'icon-pause'}`}></span>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <div className="btn-group">
                        <button 
                          onClick={() => handleToggleActive(job)} 
                          className={`btn btn-sm btn-icon ${job.is_active ? 'btn-warning' : 'btn-success'}`}
                          title={job.is_active ? 'Pause job' : 'Activate job'}
                        >
                          <span className={`icon ${job.is_active ? 'icon-pause' : 'icon-play'}`}></span>
                        </button>
                        <button 
                          onClick={() => handleEdit(job)} 
                          className="btn btn-sm btn-icon btn-secondary"
                          title="Edit job"
                        >
                          <span className="icon icon-edit"></span>
                        </button>
                        <button 
                          onClick={() => handleDelete(job.id)} 
                          className="btn btn-sm btn-icon btn-danger"
                          title="Delete job"
                        >
                          <span className="icon icon-delete"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="grid gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-secondary mb-1 flex items-center gap-2">
                          <span className="icon icon-schedule"></span>
                          Schedule
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-mono bg-secondary rounded px-2 py-1">
                            {job.cron_schedule}
                          </span>
                          <span className="text-sm text-secondary">
                            ({getScheduleDescription(job.cron_schedule)})
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-secondary mb-1 flex items-center gap-2">
                          <span className="icon icon-robot"></span>
                          AI Prompt
                        </h4>
                        <p className="text-sm leading-relaxed">
                          {job.prompt.length > 200 ? 
                            `${job.prompt.substring(0, 200)}...` : 
                            job.prompt
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-tertiary">
                        Job ID: {job.id}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleToggleActive(job)} 
                          className={`btn btn-sm ${job.is_active ? 'btn-warning' : 'btn-success'}`}
                        >
                          {job.is_active ? 'Pause Job' : 'Activate Job'}
                        </button>
                        <button 
                          onClick={() => handleEdit(job)} 
                          className="btn btn-sm btn-secondary"
                        >
                          Edit Job
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsList;
