
const express = require('express');
const cors = require('cors');
const path = require('path');
const jobsRouter = require('./routes/jobs');
const jobRunsRouter = require('./routes/jobRuns');
const testPromptRouter = require('./routes/testPrompt');
const { scheduleJobs } = require('./scheduler');
require('./database/setup');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Simple logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api/jobs', jobsRouter);
app.use('/api/job-runs', jobRunsRouter);
app.use('/api/test-prompt', testPromptRouter);

// Serve static files from frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

scheduleJobs();

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
