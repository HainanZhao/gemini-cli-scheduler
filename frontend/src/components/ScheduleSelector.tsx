import React, { useState, useEffect } from 'react';

interface ScheduleSelectorProps {
  value: string;
  onChange: (cronExpression: string) => void;
  disabled?: boolean;
}

interface SchedulePreset {
  label: string;
  value: string;
  description: string;
}

const schedulePresets: SchedulePreset[] = [
  { label: 'Every minute', value: '* * * * *', description: 'Runs every minute (for testing)' },
  { label: 'Every 15 minutes', value: '*/15 * * * *', description: 'Runs every 15 minutes' },
  { label: 'Every 30 minutes', value: '*/30 * * * *', description: 'Runs every 30 minutes' },
  { label: 'Every hour', value: '0 * * * *', description: 'Runs at the start of every hour' },
  { label: 'Every 2 hours', value: '0 */2 * * *', description: 'Runs every 2 hours' },
  { label: 'Every 6 hours', value: '0 */6 * * *', description: 'Runs every 6 hours' },
  { label: 'Daily at 9 AM', value: '0 9 * * *', description: 'Runs every day at 9:00 AM' },
  { label: 'Daily at 6 PM', value: '0 18 * * *', description: 'Runs every day at 6:00 PM' },
  { label: 'Weekdays at 9 AM', value: '0 9 * * 1-5', description: 'Runs Monday-Friday at 9:00 AM' },
  { label: 'Weekends at 10 AM', value: '0 10 * * 6,0', description: 'Runs Saturday and Sunday at 10:00 AM' },
  { label: 'Weekly (Monday 9 AM)', value: '0 9 * * 1', description: 'Runs every Monday at 9:00 AM' },
  { label: 'Monthly (1st at 9 AM)', value: '0 9 1 * *', description: 'Runs on the 1st of every month at 9:00 AM' },
  { label: 'Custom', value: 'custom', description: 'Enter your own cron expression' },
];

const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({ value, onChange, disabled = false }) => {
  const [selectedPreset, setSelectedPreset] = useState('custom');
  const [customCron, setCustomCron] = useState('');
  const [customTime, setCustomTime] = useState('09:00');
  const [customFrequency, setCustomFrequency] = useState('daily');

  useEffect(() => {
    const preset = schedulePresets.find(p => p.value === value);
    if (preset && preset.value !== 'custom') {
      setSelectedPreset(preset.value);
    } else {
      setSelectedPreset('custom');
      setCustomCron(value);
    }
  }, [value]);

  const handlePresetChange = (presetValue: string) => {
    setSelectedPreset(presetValue);
    if (presetValue !== 'custom') {
      onChange(presetValue);
    }
  };

  useEffect(() => {
    if (selectedPreset === 'custom' && customFrequency !== 'manual') {
      const generateCustomCron = () => {
        const [hours, minutes] = customTime.split(':').map(Number);
        
        switch (customFrequency) {
          case 'daily':
            return `${minutes} ${hours} * * *`;
          case 'weekdays':
            return `${minutes} ${hours} * * 1-5`;
          case 'weekends':
            return `${minutes} ${hours} * * 6,0`;
          case 'weekly':
            return `${minutes} ${hours} * * 1`; // Monday
          case 'monthly':
            return `${minutes} ${hours} 1 * *`; // 1st of month
          default:
            return `${minutes} ${hours} * * *`;
        }
      };
      
      const cron = generateCustomCron();
      setCustomCron(cron);
      onChange(cron);
    }
  }, [customTime, customFrequency, selectedPreset, onChange]);

  const generateCustomCronForDisplay = () => {
    const [hours, minutes] = customTime.split(':').map(Number);
    
    switch (customFrequency) {
      case 'daily':
        return `${minutes} ${hours} * * *`;
      case 'weekdays':
        return `${minutes} ${hours} * * 1-5`;
      case 'weekends':
        return `${minutes} ${hours} * * 6,0`;
      case 'weekly':
        return `${minutes} ${hours} * * 1`; // Monday
      case 'monthly':
        return `${minutes} ${hours} 1 * *`; // 1st of month
      default:
        return `${minutes} ${hours} * * *`;
    }
  };

  const handleManualCronChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCron = e.target.value;
    setCustomCron(newCron);
    onChange(newCron);
  };

  return (
    <div className="form-group">
      <label className="form-label required">Schedule</label>
      
      <div className="form-group">
        <select
          value={selectedPreset}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="form-control"
          disabled={disabled}
        >
          {schedulePresets.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      {selectedPreset !== 'custom' && (
        <div className="form-text">
          {schedulePresets.find(p => p.value === selectedPreset)?.description}
        </div>
      )}

      {selectedPreset === 'custom' && (
        <div className="grid gap-4 mt-4">
          <div className="form-group">
            <label className="form-label">Frequency</label>
            <select
              value={customFrequency}
              onChange={(e) => setCustomFrequency(e.target.value)}
              className="form-control"
              disabled={disabled}
            >
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays only</option>
              <option value="weekends">Weekends only</option>
              <option value="weekly">Weekly (Monday)</option>
              <option value="monthly">Monthly (1st)</option>
              <option value="manual">Manual cron expression</option>
            </select>
          </div>

          {customFrequency !== 'manual' && (
            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="form-control"
                disabled={disabled}
              />
            </div>
          )}

          {customFrequency === 'manual' && (
            <div className="form-group">
              <label className="form-label">Cron Expression</label>
              <input
                type="text"
                value={customCron}
                onChange={handleManualCronChange}
                placeholder="e.g., 0 9 * * 1-5"
                className="form-control"
                disabled={disabled}
              />
              <div className="form-text">
                Enter a valid cron expression (minute hour day month weekday)
              </div>
            </div>
          )}

          <div className="bg-secondary p-3 rounded">
            <div className="text-sm">
              <strong>Generated Cron:</strong> 
              <code className="ml-2 font-mono bg-primary text-xs px-2 py-1 rounded">
                {selectedPreset === 'custom' ? (customFrequency === 'manual' ? customCron : generateCustomCronForDisplay()) : value}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleSelector;
