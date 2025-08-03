
import React, { useState } from 'react';
import axios from 'axios';
import ScheduleSelector from './ScheduleSelector';
import PromptTester from './PromptTester';

interface JobFormProps {
  onJobCreated?: () => void;
}

const JobForm: React.FC<JobFormProps> = ({ onJobCreated }) => {
  const [name, setName] = useState('');
  const [cronSchedule, setCronSchedule] = useState('0 9 * * *'); // Default to daily at 9 AM
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!name.trim() || !cronSchedule.trim() || !prompt.trim()) {
      setError('All fields are required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await axios.post('/api/jobs', {
        name: name.trim(),
        cron_schedule: cronSchedule.trim(),
        prompt: prompt.trim(),
      });
      
      setSuccess('Job created successfully!');
      
      // Reset form after a short delay
      setTimeout(() => {
        setName('');
        setCronSchedule('0 9 * * *');
        setPrompt('');
        setSuccess('');
        
        // Notify parent component
        if (onJobCreated) {
          onJobCreated();
        }
      }, 1500);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error creating job';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
      {/* Prompt Tester */}
      <div className="lg:col-span-1">
        <PromptTester />
      </div>
      
      {/* Main Form */}
      <div className="lg:col-span-2">
        <div className="card slide-up">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <span className="icon icon-add icon-lg text-primary-500"></span>
              <div>
                <h2 className="card-title">Create New Scheduled Job</h2>
                <p className="card-subtitle">Set up an AI task to run automatically</p>
              </div>
            </div>
          </div>
          
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label required">
                  <span className="icon icon-edit"></span>
                  Job Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Daily News Summary"
                  disabled={isSubmitting}
                />
                <div className="form-text">
                  Choose a descriptive name to identify this job
                </div>
              </div>
              
              <ScheduleSelector 
                value={cronSchedule}
                onChange={setCronSchedule}
                disabled={isSubmitting}
              />
              
              <div className="form-group">
                <label className="form-label required">
                  <span className="icon icon-robot"></span>
                  AI Prompt
                </label>
                <textarea
                  className="form-control"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  placeholder="Describe the task for the AI to perform. Be specific about what you want the AI to do, analyze, or generate..."
                  disabled={isSubmitting}
                />
                <div className="form-text">
                  Write a clear, detailed prompt for the AI to follow
                </div>
              </div>
              
              {error && (
                <div className="alert alert-error">
                  <span className="icon icon-error"></span>
                  <strong>Error:</strong> {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success">
                  <span className="icon icon-success"></span>
                  {success}
                </div>
              )}
              
              <div className="btn-group mt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting || !name.trim() || !prompt.trim()}
                  className="btn btn-primary btn-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Creating Job...
                    </>
                  ) : (
                    <>
                      <span className="icon icon-add"></span>
                      Create Scheduled Job
                    </>
                  )}
                </button>
                
                {(name || prompt) && (
                  <button 
                    type="button"
                    onClick={() => {
                      setName('');
                      setPrompt('');
                      setCronSchedule('0 9 * * *');
                      setError('');
                      setSuccess('');
                    }}
                    className="btn btn-secondary"
                    disabled={isSubmitting}
                  >
                    <span className="icon icon-refresh"></span>
                    Clear Form
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        
        {/* Info Card */}
        <div className="card mt-6">
          <div className="card-body">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <span className="icon icon-info"></span>
              How It Works
            </h4>
            <div className="grid gap-4 text-sm text-secondary">
              <div className="flex items-start gap-3">
                <span className="icon icon-robot text-lg"></span>
                <div>
                  <strong>AI Processing:</strong> Your prompt will be sent to Gemini AI at the scheduled time
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="icon icon-schedule text-lg"></span>
                <div>
                  <strong>Reliable Scheduling:</strong> Jobs run automatically using cron expressions
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="icon icon-history text-lg"></span>
                <div>
                  <strong>Execution History:</strong> View results and performance in the History tab
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobForm;
