
const cron = require('node-cron');
const { exec } = require('child_process');
const db = require('./database/db');

const scheduledJobs = new Map();

function executeJob(job) {
  const startTime = new Date();
  const jobRun = db.prepare('INSERT INTO job_runs (job_id, status, start_time) VALUES (?, ?, ?)').run(job.id, 'running', startTime.toISOString());

  exec(`gemini-cli --prompt "${job.prompt}"`, (error, stdout, stderr) => {
    const endTime = new Date();
    let status = 'success';
    let output = stdout;

    if (error) {
      status = 'failure';
      output = `${error.message}\n${stderr}`;
    }

    db.prepare('UPDATE job_runs SET status = ?, output = ?, end_time = ? WHERE id = ?').run(status, output, endTime.toISOString(), jobRun.lastInsertRowid);
  });
}

function scheduleJob(job) {
  if (scheduledJobs.has(job.id)) {
    scheduledJobs.get(job.id).destroy();
  }
  
  if (job.is_active) {
    const task = cron.schedule(job.cron_schedule, () => executeJob(job), {
      scheduled: false
    });
    task.start();
    scheduledJobs.set(job.id, task);
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
