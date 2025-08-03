# Gemini CLI Scheduler - Architecture Documentation

## Overview

The Gemini CLI Scheduler is a full-stack web application designed to automate and schedule AI tasks using the Gemini CLI tool. It provides a user-friendly interface for creating, managing, and monitoring scheduled jobs that execute Gemini CLI prompts.

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Gemini CLI    │
│   (React/TS)    │◄──►│   (Node.js)     │◄──►│   (External)    │
│   Port 5174     │    │   Port 3001     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser  │    │   SQLite DB     │    │   AI Responses  │
│   Interface     │    │   scheduler.db  │    │   & Outputs     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend (React + TypeScript + Vite)
- **Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 7.0.4
- **HTTP Client**: Axios 1.11.0
- **Styling**: Inline styles with modern CSS features
- **Development**: Hot reload, ESLint, TypeScript compilation

#### Backend (Node.js + Express)
- **Runtime**: Node.js
- **Framework**: Express 5.1.0
- **Database**: SQLite with better-sqlite3 12.2.0
- **Scheduler**: node-cron 4.2.1
- **Process Execution**: child_process.exec for Gemini CLI
- **CORS**: cors 2.8.5 for cross-origin requests

#### External Integration
- **Gemini CLI**: Command-line interface for Google's Gemini AI
- **Execution**: Via child_process.exec with timeout handling
- **Output Capture**: Both stdout and stderr captured

## Database Schema

### Tables Structure

#### `jobs` Table
```sql
CREATE TABLE jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                    -- Human-readable job name
  cron_schedule TEXT NOT NULL,           -- Cron expression (e.g., "0 9 * * 1-5")
  prompt TEXT NOT NULL,                  -- Gemini CLI prompt text
  is_active BOOLEAN NOT NULL DEFAULT 1   -- Job activation status
);
```

#### `job_runs` Table
```sql
CREATE TABLE job_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL,               -- Foreign key to jobs.id
  status TEXT NOT NULL,                  -- 'running', 'success', 'failure'
  output TEXT,                           -- Captured command output
  start_time DATETIME NOT NULL,          -- ISO 8601 timestamp
  end_time DATETIME,                     -- ISO 8601 timestamp (null if running)
  FOREIGN KEY (job_id) REFERENCES jobs (id)
);
```

## API Architecture

### RESTful Endpoints

#### Jobs Management (`/api/jobs`)
```
GET    /api/jobs           # List all jobs
POST   /api/jobs           # Create new job
PUT    /api/jobs/:id       # Update job (name, schedule, prompt, status)
DELETE /api/jobs/:id       # Delete job
```

#### Job Runs History (`/api/job-runs`)
```
GET    /api/job-runs       # List job execution history
                          # Query params: job_id, status, start_time, end_time
```

#### Prompt Testing (`/api/test-prompt`)
```
POST   /api/test-prompt/test  # Test prompt immediately without scheduling
```

### Request/Response Formats

#### Create Job Request
```json
{
  "name": "Daily News Summary",
  "cron_schedule": "0 9 * * 1-5",
  "prompt": "Summarize today's top technology news"
}
```

#### Job Response
```json
{
  "id": 1,
  "name": "Daily News Summary",
  "cron_schedule": "0 9 * * 1-5",
  "prompt": "Summarize today's top technology news",
  "is_active": true
}
```

#### Job Run Response
```json
{
  "id": 1,
  "job_id": 1,
  "job_name": "Daily News Summary",
  "status": "success",
  "output": "Here's today's technology news summary...",
  "start_time": "2025-08-03T09:00:00.000Z",
  "end_time": "2025-08-03T09:00:15.000Z"
}
```

## Component Architecture

### Frontend Components Hierarchy
```
App.tsx
├── JobForm.tsx
│   ├── PromptTester.tsx          # Test prompts before scheduling
│   └── ScheduleSelector.tsx      # User-friendly cron selection
├── JobsList.tsx
│   └── ScheduleSelector.tsx      # Used in edit mode
└── TimelineView.tsx              # Job run history and output modal
```

### Component Responsibilities

#### `JobForm.tsx`
- Create new scheduled jobs
- Integrate prompt testing
- User-friendly schedule selection
- Form validation and submission

#### `PromptTester.tsx`
- Test Gemini CLI prompts instantly
- Display execution results and timing
- Provide feedback before job creation
- Handle test API calls

#### `ScheduleSelector.tsx`
- Convert cron expressions to user-friendly options
- Provide preset schedules (daily, weekdays, etc.)
- Visual time picker for custom schedules
- Support manual cron entry for advanced users

#### `JobsList.tsx`
- Display all configured jobs
- Edit/delete job functionality
- Toggle job active status
- Show human-readable schedule descriptions

#### `TimelineView.tsx`
- Chronological job run visualization
- Color-coded status indicators
- Detailed output modal on click
- Job run filtering and search

## Scheduling System

### Dynamic Job Scheduling
```javascript
// Scheduler maintains a Map of active cron jobs
const scheduledJobs = new Map(); // jobId -> cronTask

// Functions for dynamic management
scheduleJob(job)    // Add/update job in scheduler
removeJob(jobId)    // Remove job from scheduler
executeJob(job)     // Execute job and record results
```

### Job Execution Flow
1. **Trigger**: Cron schedule fires
2. **Database**: Insert job_run with 'running' status
3. **Execute**: Run `gemini-cli --prompt "user_prompt"`
4. **Capture**: Collect stdout/stderr output
5. **Update**: Set final status and end_time
6. **Store**: Save complete output to database

### Cron Schedule Examples
```
"* * * * *"        # Every minute (testing)
"0 9 * * 1-5"      # Weekdays at 9 AM
"0 */2 * * *"      # Every 2 hours
"0 9 1 * *"        # Monthly on 1st at 9 AM
```

## Security Considerations

### Input Validation
- Cron expression validation
- Prompt text sanitization
- SQL injection prevention via prepared statements
- Command injection protection in exec calls

### Process Management
- Timeout handling for long-running Gemini CLI calls (30s)
- Error capture and logging
- Graceful failure handling

## Development Workflow

### Development Environment
```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Frontend only (Vite dev server)
npm run dev:backend      # Backend only (nodemon)
```

### Production Build
```bash
npm run build           # Build frontend for production
npm start              # Start production server
```

### File Structure
```
gemini-cli-scheduler/
├── package.json                 # Root package with scripts
├── README.md                   # User documentation
├── GEMINI.md                   # This architecture guide
├── todo.md                     # Project completion status
├── backend/
│   ├── package.json
│   └── src/
│       ├── index.js            # Express server entry point
│       ├── scheduler.js        # Cron job management
│       ├── database/
│       │   ├── setup.js        # Database initialization
│       │   └── db.js           # Database connection
│       └── routes/
│           ├── jobs.js         # Job CRUD operations
│           ├── jobRuns.js      # Job history API
│           └── testPrompt.js   # Prompt testing API
└── frontend/
    ├── package.json
    ├── vite.config.ts          # Vite configuration with proxy
    └── src/
        ├── App.tsx             # Main application component
        ├── main.tsx            # React entry point
        └── components/
            ├── JobForm.tsx
            ├── JobsList.tsx
            ├── TimelineView.tsx
            ├── ScheduleSelector.tsx
            └── PromptTester.tsx
```

## Integration Points for Gemini CLI

### Command Execution Pattern
```bash
gemini-cli --prompt "Your prompt text here"
```

### Expected Gemini CLI Behavior
- **Input**: Text prompt via command line argument
- **Output**: Response text to stdout
- **Errors**: Error messages to stderr
- **Exit Code**: 0 for success, non-zero for failure

### Output Handling
- All stdout captured as successful output
- stderr captured as error information
- Execution time tracked for performance monitoring
- Timeout after 30 seconds to prevent hanging

### Prompt Formatting
- Prompts are passed as-is to Gemini CLI
- No additional formatting or preprocessing
- Users responsible for prompt engineering
- Testing feature allows validation before scheduling

## Monitoring and Observability

### Job Run Tracking
- Complete execution history in database
- Status tracking (running, success, failure)
- Execution duration measurement
- Full output capture and storage

### User Interface Features
- Real-time job status indicators
- Timeline visualization of executions
- Detailed output viewing in modal
- Job management with visual feedback

### Error Handling
- Graceful API error responses
- User-friendly error messages
- Detailed error logging in job runs
- Timeout and failure recovery

## Future Enhancement Opportunities

### Potential Improvements
- Job run retention policies
- Email/webhook notifications
- Job dependency management
- Bulk job operations
- Export/import job configurations
- Advanced scheduling (timezone support)
- Job run analytics and reporting

### Scalability Considerations
- Database migration to PostgreSQL for larger deployments
- Job queue system for high-volume scheduling
- Horizontal scaling with load balancing
- Monitoring and alerting integration

---

This architecture provides a robust foundation for automating Gemini CLI tasks while maintaining simplicity and user-friendliness. The system is designed to be reliable, maintainable, and extensible for future requirements.
