import React, { useState, useEffect, useCallback } from 'react';

interface ScheduleSelectorProps {
  value: string;
  onChange: (cronExpression: string) => void;
  disabled?: boolean;
}

type RecurrenceType = 'minute' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';

interface WeeklyOptions {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

interface MonthlyOptions {
  type: 'day' | 'weekday';
  dayOfMonth: number;
  weekOfMonth: number;
  dayOfWeek: number;
}

const quickPresets = [
  { label: 'Every minute (testing)', value: '* * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Daily at 9 AM', value: '0 9 * * *' },
  { label: 'Weekdays at 9 AM', value: '0 9 * * 1-5' },
  { label: 'Weekly on Monday', value: '0 9 * * 1' },
  { label: 'Monthly on 1st', value: '0 9 1 * *' },
];

const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({ value, onChange, disabled = false }) => {
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily');
  const [time, setTime] = useState('09:00');
  const [minuteInterval, setMinuteInterval] = useState(15);
  const [hourInterval, setHourInterval] = useState(1);
  const [dailyInterval, setDailyInterval] = useState(1);
  const [weeklyInterval, setWeeklyInterval] = useState(1);
  const [monthlyInterval, setMonthlyInterval] = useState(1);
  const [customCron, setCustomCron] = useState('');
  const [showQuickPresets, setShowQuickPresets] = useState(true);
  
  const [weeklyOptions, setWeeklyOptions] = useState<WeeklyOptions>({
    monday: true,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });
  
  const [monthlyOptions, setMonthlyOptions] = useState<MonthlyOptions>({
    type: 'day',
    dayOfMonth: 1,
    weekOfMonth: 1,
    dayOfWeek: 1,
  });

  const generateCronExpression = useCallback((): string => {
    const [hours, minutes] = time.split(':').map(Number);
    
    switch (recurrenceType) {
      case 'minute':
        return `*/${minuteInterval} * * * *`;
      
      case 'hourly':
        return `${minutes} */${hourInterval} * * *`;
      
      case 'daily': {
        if (dailyInterval === 1) {
          return `${minutes} ${hours} * * *`;
        } else {
          return `${minutes} ${hours} */${dailyInterval} * *`;
        }
      }
      
      case 'weekly': {
        const selectedDays = Object.entries(weeklyOptions)
          .filter(([, selected]) => selected)
          .map(([day]) => {
            const dayMap: Record<string, number> = {
              sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
              thursday: 4, friday: 5, saturday: 6
            };
            return dayMap[day];
          })
          .sort((a, b) => a - b);
        
        if (selectedDays.length === 0) return `${minutes} ${hours} * * 1`;
        if (selectedDays.length === 1) return `${minutes} ${hours} * * ${selectedDays[0]}`;
        if (selectedDays.length === 5 && selectedDays.every(d => d >= 1 && d <= 5)) {
          return `${minutes} ${hours} * * 1-5`;
        }
        return `${minutes} ${hours} * * ${selectedDays.join(',')}`;
      }
      
      case 'monthly': {
        if (monthlyOptions.type === 'day') {
          return `${minutes} ${hours} ${monthlyOptions.dayOfMonth} * *`;
        } else {
          return `${minutes} ${hours} * * ${monthlyOptions.dayOfWeek}`;
        }
      }
      
      case 'custom':
        return customCron;
      
      default:
        return `${minutes} ${hours} * * *`;
    }
  }, [recurrenceType, time, minuteInterval, hourInterval, dailyInterval, 
      weeklyOptions, monthlyOptions, customCron]);

  useEffect(() => {
    if (value && value !== '') {
      const preset = quickPresets.find(p => p.value === value);
      if (preset) {
        setShowQuickPresets(true);
        return;
      }
      
      const parts = value.split(' ');
      if (parts.length === 5) {
        const [minute, hour, day, month, weekday] = parts;
        
        if (hour !== '*' && minute !== '*') {
          const hourNum = parseInt(hour);
          const minuteNum = parseInt(minute);
          if (!isNaN(hourNum) && !isNaN(minuteNum)) {
            const timeStr = `${hourNum.toString().padStart(2, '0')}:${minuteNum.toString().padStart(2, '0')}`;
            setTime(timeStr);
          }
        }
        
        if (minute.includes('*/') && hour === '*') {
          setRecurrenceType('minute');
          const interval = parseInt(minute.split('*/')[1]);
          if (!isNaN(interval)) setMinuteInterval(interval);
        } else if (minute !== '*' && hour.includes('*/')) {
          setRecurrenceType('hourly');
          const interval = parseInt(hour.split('*/')[1]);
          if (!isNaN(interval)) setHourInterval(interval);
        } else if (day === '*' && month === '*' && weekday === '*') {
          setRecurrenceType('daily');
        } else if (day === '*' && month === '*' && weekday !== '*') {
          setRecurrenceType('weekly');
          const newWeeklyOptions = {
            monday: false, tuesday: false, wednesday: false, thursday: false,
            friday: false, saturday: false, sunday: false
          };
          
          if (weekday.includes(',')) {
            weekday.split(',').forEach(d => {
              const dayNum = parseInt(d);
              switch (dayNum) {
                case 1: newWeeklyOptions.monday = true; break;
                case 2: newWeeklyOptions.tuesday = true; break;
                case 3: newWeeklyOptions.wednesday = true; break;
                case 4: newWeeklyOptions.thursday = true; break;
                case 5: newWeeklyOptions.friday = true; break;
                case 6: newWeeklyOptions.saturday = true; break;
                case 0: newWeeklyOptions.sunday = true; break;
              }
            });
          } else if (weekday.includes('-')) {
            if (weekday === '1-5') {
              newWeeklyOptions.monday = newWeeklyOptions.tuesday = newWeeklyOptions.wednesday = 
              newWeeklyOptions.thursday = newWeeklyOptions.friday = true;
            }
          } else {
            const dayNum = parseInt(weekday);
            switch (dayNum) {
              case 1: newWeeklyOptions.monday = true; break;
              case 2: newWeeklyOptions.tuesday = true; break;
              case 3: newWeeklyOptions.wednesday = true; break;
              case 4: newWeeklyOptions.thursday = true; break;
              case 5: newWeeklyOptions.friday = true; break;
              case 6: newWeeklyOptions.saturday = true; break;
              case 0: newWeeklyOptions.sunday = true; break;
            }
          }
          setWeeklyOptions(newWeeklyOptions);
        } else if (day !== '*' && weekday === '*') {
          setRecurrenceType('monthly');
          const dayNum = parseInt(day);
          if (!isNaN(dayNum)) {
            setMonthlyOptions(prev => ({ ...prev, dayOfMonth: dayNum }));
          }
        } else {
          setRecurrenceType('custom');
          setCustomCron(value);
        }
        setShowQuickPresets(false);
      }
    }
  }, [value]);

  useEffect(() => {
    if (!showQuickPresets) {
      const newCron = generateCronExpression();
      onChange(newCron);
    }
  }, [recurrenceType, time, minuteInterval, hourInterval, dailyInterval, weeklyInterval, 
      monthlyInterval, weeklyOptions, monthlyOptions, customCron, showQuickPresets, generateCronExpression, onChange]);

  const handleQuickPresetChange = (presetValue: string) => {
    onChange(presetValue);
    setShowQuickPresets(true);
  };

  const handleCustomScheduleClick = () => {
    setShowQuickPresets(false);
    const newCron = generateCronExpression();
    onChange(newCron);
  };

  const toggleWeekday = (day: keyof WeeklyOptions) => {
    setWeeklyOptions(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const getHumanReadableSchedule = (): string => {
    if (showQuickPresets) {
      const preset = quickPresets.find(p => p.value === value);
      return preset ? preset.label : value;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const timeStr = new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    switch (recurrenceType) {
      case 'minute':
        return `Every ${minuteInterval} minute${minuteInterval > 1 ? 's' : ''}`;
      
      case 'hourly':
        return `Every ${hourInterval} hour${hourInterval > 1 ? 's' : ''} at ${minutes} minutes past the hour`;
      
      case 'daily': {
        if (dailyInterval === 1) {
          return `Daily at ${timeStr}`;
        } else {
          return `Every ${dailyInterval} days at ${timeStr}`;
        }
      }
      
      case 'weekly': {
        const selectedDays = Object.entries(weeklyOptions)
          .filter(([, selected]) => selected)
          .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1));
        
        if (selectedDays.length === 0) return `Weekly on Monday at ${timeStr}`;
        if (selectedDays.length === 5 && !weeklyOptions.saturday && !weeklyOptions.sunday) {
          return `Weekdays at ${timeStr}`;
        }
        if (selectedDays.length === 2 && weeklyOptions.saturday && weeklyOptions.sunday) {
          return `Weekends at ${timeStr}`;
        }
        return `Weekly on ${selectedDays.join(', ')} at ${timeStr}`;
      }
      
      case 'monthly': {
        if (monthlyOptions.type === 'day') {
          return `Monthly on the ${monthlyOptions.dayOfMonth}${getOrdinalSuffix(monthlyOptions.dayOfMonth)} at ${timeStr}`;
        } else {
          const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const ordinals = ['first', 'second', 'third', 'fourth', 'last'];
          return `Monthly on the ${ordinals[monthlyOptions.weekOfMonth - 1]} ${weekdays[monthlyOptions.dayOfWeek]} at ${timeStr}`;
        }
      }
      
      case 'custom':
        return `Custom: ${customCron}`;
      
      default:
        return '';
    }
  };

  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  return (
    <div className="form-group">
      <label className="form-label required">Schedule</label>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          type="button"
          className={`btn ${showQuickPresets ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setShowQuickPresets(true)}
          disabled={disabled}
        >
          Quick Presets
        </button>
        <button
          type="button"
          className={`btn ${!showQuickPresets ? 'btn-primary' : 'btn-secondary'}`}
          onClick={handleCustomScheduleClick}
          disabled={disabled}
        >
          Custom Schedule
        </button>
      </div>

      {showQuickPresets ? (
        <div className="form-group">
          <select
            value={value}
            onChange={(e) => handleQuickPresetChange(e.target.value)}
            className="form-control"
            disabled={disabled}
          >
            {quickPresets.map((preset, index) => (
              <option key={index} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">Repeat</label>
            <select
              value={recurrenceType}
              onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
              className="form-control"
              disabled={disabled}
            >
              <option value="minute">Minutes</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom Cron</option>
            </select>
          </div>

          {recurrenceType === 'minute' && (
            <div className="form-group">
              <label className="form-label">Every</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="59"
                  value={minuteInterval}
                  onChange={(e) => setMinuteInterval(parseInt(e.target.value) || 1)}
                  className="form-control w-20"
                  disabled={disabled}
                />
                <span>minute{minuteInterval > 1 ? 's' : ''}</span>
              </div>
            </div>
          )}

          {recurrenceType === 'hourly' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Every</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={hourInterval}
                    onChange={(e) => setHourInterval(parseInt(e.target.value) || 1)}
                    className="form-control w-20"
                    disabled={disabled}
                  />
                  <span>hour{hourInterval > 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">At minute</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={parseInt(time.split(':')[1])}
                  onChange={(e) => {
                    const hour = time.split(':')[0];
                    setTime(`${hour}:${(parseInt(e.target.value) || 0).toString().padStart(2, '0')}`);
                  }}
                  className="form-control"
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {recurrenceType === 'daily' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Every</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={dailyInterval}
                    onChange={(e) => setDailyInterval(parseInt(e.target.value) || 1)}
                    className="form-control w-20"
                    disabled={disabled}
                  />
                  <span>day{dailyInterval > 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">At time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="form-control"
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {recurrenceType === 'weekly' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Every</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={weeklyInterval}
                      onChange={(e) => setWeeklyInterval(parseInt(e.target.value) || 1)}
                      className="form-control w-20"
                      disabled={disabled}
                    />
                    <span>week{weeklyInterval > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">At time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="form-control"
                    disabled={disabled}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">On days</label>
                <div className="grid grid-cols-7 gap-2">
                  {(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const).map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`btn btn-sm ${weeklyOptions[day] ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => toggleWeekday(day)}
                      disabled={disabled}
                    >
                      {day.slice(0, 3).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {recurrenceType === 'monthly' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Every</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={monthlyInterval}
                      onChange={(e) => setMonthlyInterval(parseInt(e.target.value) || 1)}
                      className="form-control w-20"
                      disabled={disabled}
                    />
                    <span>month{monthlyInterval > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">At time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="form-control"
                    disabled={disabled}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">On</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={monthlyOptions.type === 'day'}
                      onChange={() => setMonthlyOptions(prev => ({ ...prev, type: 'day' }))}
                      disabled={disabled}
                    />
                    <span>Day</span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={monthlyOptions.dayOfMonth}
                      onChange={(e) => setMonthlyOptions(prev => ({ 
                        ...prev, 
                        dayOfMonth: parseInt(e.target.value) || 1 
                      }))}
                      className="form-control w-20"
                      disabled={disabled || monthlyOptions.type !== 'day'}
                    />
                    <span>of the month</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={monthlyOptions.type === 'weekday'}
                      onChange={() => setMonthlyOptions(prev => ({ ...prev, type: 'weekday' }))}
                      disabled={disabled}
                    />
                    <span>The</span>
                    <select
                      value={monthlyOptions.weekOfMonth}
                      onChange={(e) => setMonthlyOptions(prev => ({ 
                        ...prev, 
                        weekOfMonth: parseInt(e.target.value) 
                      }))}
                      className="form-control w-24"
                      disabled={disabled || monthlyOptions.type !== 'weekday'}
                    >
                      <option value={1}>first</option>
                      <option value={2}>second</option>
                      <option value={3}>third</option>
                      <option value={4}>fourth</option>
                      <option value={-1}>last</option>
                    </select>
                    <select
                      value={monthlyOptions.dayOfWeek}
                      onChange={(e) => setMonthlyOptions(prev => ({ 
                        ...prev, 
                        dayOfWeek: parseInt(e.target.value) 
                      }))}
                      className="form-control"
                      disabled={disabled || monthlyOptions.type !== 'weekday'}
                    >
                      <option value={0}>Sunday</option>
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          )}

          {recurrenceType === 'custom' && (
            <div className="form-group">
              <label className="form-label">Cron Expression</label>
              <input
                type="text"
                value={customCron}
                onChange={(e) => setCustomCron(e.target.value)}
                placeholder="0 9 * * 1-5"
                className="form-control font-mono"
                disabled={disabled}
              />
              <div className="form-text">
                Format: minute hour day month weekday (e.g., "0 9 * * 1-5" for weekdays at 9 AM)
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-secondary p-4 rounded-lg mt-4">
        <div className="text-sm">
          <div className="font-semibold mb-2">Schedule Preview:</div>
          <div className="text-primary">{getHumanReadableSchedule()}</div>
          <div className="text-xs text-secondary mt-2 font-mono">
            Cron: {showQuickPresets ? value : generateCronExpression()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSelector;
