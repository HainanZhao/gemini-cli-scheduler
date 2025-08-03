
import React, { useState } from 'react';
import axios from 'axios';

interface JobFormProps {
  onJobCreated?: () => void;
}

const JobForm: React.FC<JobFormProps> = ({ onJobCreated }) => {
  const [name, setName] = useState('');
  const [cronSchedule, setCronSchedule] = useState('');
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateCronSchedule = (cron: string): boolean => {
    // Basic cron validation - should have 5 parts separated by spaces
    const parts = cron.trim().split(/\s+/);
    return parts.length === 5;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim() || !cronSchedule.trim() || !prompt.trim()) {
      setError('All fields are required');
      return;
    }
    
    if (!validateCronSchedule(cronSchedule)) {
      setError('Invalid cron schedule format. Use 5 fields: minute hour day month weekday');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await axios.post('/api/jobs', {
        name: name.trim(),
        cron_schedule: cronSchedule.trim(),
        prompt: prompt.trim(),
      });
      
      // Reset form
      setName('');
      setCronSchedule('');
      setPrompt('');
      
      // Notify parent component
      if (onJobCreated) {
        onJobCreated();
      }
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
    <div style={{ margin: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Create New Job</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Job Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Cron Schedule (e.g., 0 0 * * *)"
            value={cronSchedule}
            onChange={(e) => setCronSchedule(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
          />
          <small style={{ color: '#666' }}>
            Format: minute hour day month weekday (e.g., "0 9 * * 1-5" for weekdays at 9 AM)
          </small>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <textarea
            placeholder="Prompt for Gemini CLI"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
          />
        </div>
        {error && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            {error}
          </div>
        )}
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Creating...' : 'Create Job'}
        </button>
      </form>
    </div>
  );
};

export default JobForm;
