# Gemini CLI Scheduler

A web-based application for scheduling, running, and monitoring AI agent jobs using the Gemini CLI tool.

## Features

- **Job Management**: Create, edit, delete, and activate/deactivate scheduled jobs
- **Cron Scheduling**: Use standard cron expressions to schedule job execution
- **Real-time Monitoring**: View job execution history and status in a timeline view
- **Output Inspection**: Click on any job run to view detailed output from the Gemini CLI
- **Dynamic Scheduling**: Add, modify, or remove jobs without restarting the server
- **Web Interface**: Modern React-based frontend with TypeScript support

## Project Structure

```
gemini-cli-scheduler/
├── backend/                 # Express.js server
│   ├── src/
│   │   ├── index.js        # Main server file
│   │   ├── scheduler.js    # Job scheduling logic
│   │   ├── database/       # Database setup and connection
│   │   └── routes/         # API endpoints
│   └── package.json
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   └── package.json
└── README.md
```

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Gemini CLI** - You need to have the `gemini-cli` tool installed and accessible from your PATH

### Installing Gemini CLI

Make sure you have the Gemini CLI installed and configured. You can typically install it via:

```bash
# Example - replace with actual installation method for gemini-cli
npm install -g gemini-cli
```

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd gemini-cli-scheduler
   ```

2. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

   This will install dependencies for the root project, backend, and frontend.

## Development

### Running in Development Mode

To run both the backend and frontend in development mode with hot reloading:

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend development server on http://localhost:5173

### Running Backend Only

```bash
npm run dev:backend
```

### Running Frontend Only

```bash
npm run dev:frontend
```

## Production

### Building for Production

1. **Build the frontend**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

The production server will serve both the API and the built frontend from a single port (3001 by default).

## Usage

### Creating Jobs

1. Open the application in your browser
2. Fill out the "Create New Job" form:
   - **Job Name**: A descriptive name for your job
   - **Cron Schedule**: A cron expression (e.g., `0 9 * * 1-5` for weekdays at 9 AM)
   - **Prompt**: The prompt text to send to Gemini CLI
3. Click "Create Job"

### Managing Jobs

- **View Jobs**: All jobs are listed in the "Jobs List" section
- **Activate/Deactivate**: Use the toggle buttons to enable/disable job execution
- **Edit**: Click "Edit" to modify job details
- **Delete**: Click "Delete" to remove a job (with confirmation)

### Monitoring Job Runs

- **Timeline View**: See all job executions in chronological order
- **Status Indicators**: Color-coded status (green=success, red=failure, yellow=running)
- **Job Details**: Click on any job run to see the full output from Gemini CLI

### Cron Schedule Examples

- `0 9 * * 1-5` - Every weekday at 9:00 AM
- `0 */2 * * *` - Every 2 hours
- `30 14 * * 0` - Every Sunday at 2:30 PM
- `0 0 1 * *` - First day of every month at midnight
- `*/15 * * * *` - Every 15 minutes

## API Endpoints

### Jobs
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create a new job
- `PUT /api/jobs/:id` - Update a job
- `DELETE /api/jobs/:id` - Delete a job

### Job Runs
- `GET /api/job-runs` - List job execution history
  - Query parameters: `job_id`, `status`, `start_time`, `end_time`

## Database

The application uses SQLite with the following tables:

### jobs
- `id` - Primary key
- `name` - Job name
- `cron_schedule` - Cron expression
- `prompt` - Gemini CLI prompt
- `is_active` - Whether the job is active

### job_runs
- `id` - Primary key
- `job_id` - Foreign key to jobs table
- `status` - Execution status (running, success, failure)
- `output` - Command output
- `start_time` - Execution start time
- `end_time` - Execution end time

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## Troubleshooting

### Common Issues

1. **"gemini-cli command not found"**
   - Ensure Gemini CLI is installed and in your PATH
   - Test with: `gemini-cli --help`

2. **Jobs not executing**
   - Check that jobs are marked as active
   - Verify cron expression format
   - Check server logs for errors

3. **Frontend can't connect to backend**
   - Ensure backend is running on port 3001
   - Check that proxy configuration is correct in vite.config.ts

### Logs

Check the server console for job execution logs and error messages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
