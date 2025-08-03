
const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
  try {
    const { job_id, status, start_time, end_time } = req.query;
    let query = `
      SELECT jr.*, j.name as job_name 
      FROM job_runs jr 
      LEFT JOIN jobs j ON jr.job_id = j.id
    `;
    const conditions = [];
    const params = [];

    if (job_id) {
      conditions.push('jr.job_id = ?');
      params.push(job_id);
    }
    
    if (status) {
      conditions.push('jr.status = ?');
      params.push(status);
    }
    
    if (start_time) {
      conditions.push('jr.start_time >= ?');
      params.push(start_time);
    }
    
    if (end_time) {
      conditions.push('jr.start_time <= ?');
      params.push(end_time);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY jr.start_time DESC';

    const jobRuns = db.prepare(query).all(params);
    res.json(jobRuns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
