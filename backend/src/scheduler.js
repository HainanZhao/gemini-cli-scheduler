const cron = require('node-cron');
const db = require('./database/db');
const { executeGeminiPrompt } = require('./services/geminiService');

const scheduledJobs = new Map();

async function executeJob(job) {
  console.log(`Executing job: ${job.name} (ID: ${job.id})`);
  
  const startTime = new Date();
  let jobRunId;
  
  try {
    const jobRun = db.prepare('INSERT INTO job_runs (job_id, status, start_time) VALUES (?, ?, ?)').run(job.id, 'running', startTime.toISOString());
    jobRunId = jobRun.lastInsertRowid;
  } catch (error) {
    console.error(`Failed to create job run record for job ${job.id}:`, error);
    return;
  }

  let status = 'success';
  let output = '';

  try {
    output = await executeGeminiPrompt(job.prompt);
    console.log(`Job ${job.name} (ID: ${job.id}) completed successfully`);
  } catch (error) {
    status = 'failure';
    output = error.message;
    console.error(`Job ${job.name} (ID: ${job.id}) failed:`, error.message);
  } finally {
    const endTime = new Date();
    try {
      db.prepare('UPDATE job_runs SET status = ?, output = ?, end_time = ? WHERE id = ?')
        .run(status, output, endTime.toISOString(), jobRunId);
    } catch (dbError) {
      console.error(`Failed to update job run record ${jobRunId}:`, dbError);
    }
  }
}

function scheduleJob(job) {
  console.log(`Scheduling job: ${job.name} (ID: ${job.id}) with schedule: ${job.cron_schedule}`);
  
  // Remove existing scheduled job if it exists
  if (scheduledJobs.has(job.id)) {
    scheduledJobs.get(job.id).destroy();
    scheduledJobs.delete(job.id);
  }
  
  if (job.is_active) {
    try {
      // Validate cron expression before scheduling
      if (!cron.validate(job.cron_schedule)) {
        console.error(`Invalid cron expression for job ${job.id}: ${job.cron_schedule}`);
        return;
      }
      
      const task = cron.schedule(job.cron_schedule, () => {
        try {
          executeJob(job);
        } catch (error) {
          console.error(`Error executing job ${job.id}:`, error);
        }
      }, {
        scheduled: false
      });
      
      task.start();
      scheduledJobs.set(job.id, task);
      console.log(`Job ${job.id} scheduled successfully`);
    } catch (error) {
      console.error(`Failed to schedule job ${job.id}:`, error);
    }
  }
}

function scheduleJobs() {
  const jobs = db.prepare('SELECT * FROM jobs WHERE is_active = true').all();
  jobs.forEach(scheduleJob);
}

function addJob(job) {
  scheduleJob(job);
}

function updateJob(job) {
  scheduleJob(job);
}

function removeJob(jobId) {
  if (scheduledJobs.has(jobId)) {
    scheduledJobs.get(jobId).destroy();
    scheduledJobs.delete(jobId);
  }
}

module.exports = { scheduleJobs, addJob, updateJob, removeJob };