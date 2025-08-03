
const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { addJob, updateJob, removeJob } = require('../scheduler');

router.get('/', (req, res) => {
  try {
    const jobs = db.prepare('SELECT * FROM jobs').all();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, cron_schedule, prompt } = req.body;
    
    if (!name || !cron_schedule || !prompt) {
      return res.status(400).json({ error: 'Name, cron_schedule, and prompt are required' });
    }
    
    const result = db.prepare('INSERT INTO jobs (name, cron_schedule, prompt) VALUES (?, ?, ?)').run(name, cron_schedule, prompt);
    const newJob = db.prepare('SELECT * FROM jobs WHERE id = ?').get(result.lastInsertRowid);
    
    addJob(newJob);
    res.json(newJob);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, cron_schedule, prompt, is_active } = req.body;
    
    let query = 'UPDATE jobs SET ';
    const params = [];
    const updates = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (cron_schedule !== undefined) {
      updates.push('cron_schedule = ?');
      params.push(cron_schedule);
    }
    if (prompt !== undefined) {
      updates.push('prompt = ?');
      params.push(prompt);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
    }
    
    query += updates.join(', ') + ' WHERE id = ?';
    params.push(id);
    
    const result = db.prepare(query).run(...params);
    const updatedJob = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    
    updateJob(updatedJob);
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM jobs WHERE id = ?').run(id);
    
    removeJob(parseInt(id));
    res.json({ success: true, changes: result.changes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
