# Gemini Scheduler - Action Plan

This document outlines the steps for an AI agent to build the Gemini Scheduler, a web-based application for scheduling, running, and monitoring AI agent jobs.

## Phase 1: Project Scaffolding & Initial Setup

- [ ] Initialize a root Node.js project (`npm init -y`).
- [ ] Create a `backend` directory for the server-side code.
- [ ] Initialize a Node.js project within the `backend` directory (`cd backend && npm init -y`).
- [ ] Install backend dependencies: `express`, `node-cron`, `better-sqlite3`, and `cors`.
- [ ] Create a `frontend` directory for the client-side application.
- [ ] Scaffold a React + TypeScript project in the `frontend` directory using Vite (`npm create vite@latest . -- --template react-ts`).
- [ ] Install frontend dependencies: `axios` for API communication and a timeline library like `vis-timeline-graph2d` for visualization.

## Phase 2: Backend - Database and API Development

- [ ] Create a database initialization script (`backend/src/database/setup.js`).
    - [ ] Define the schema for a `jobs` table (e.g., `id`, `name`, `cron_schedule`, `prompt`, `is_active`).
    - [ ] Define the schema for a `job_runs` table (e.g., `id`, `job_id`, `status`, `output`, `start_time`, `end_time`).
- [ ] Set up the main Express server file (`backend/src/index.js`).
- [ ] Implement RESTful API endpoints for managing jobs (`/api/jobs`):
    - [ ] `GET /`: List all jobs.
    - [ ] `POST /`: Create a new job.
    - [ ] `PUT /:id`: Update an existing job (e.g., to activate/deactivate it).
    - [ ] `DELETE /:id`: Delete a job.
- [ ] Implement API endpoints for retrieving job execution history (`/api/job-runs`):
    - [ ] `GET /`: List all job runs, with query parameters for filtering by `job_id`, `status`, and time range.

## Phase 3: Backend - Core Scheduling Logic

- [ ] Create a scheduler service module (`backend/src/scheduler.js`).
- [ ] On application startup, the scheduler service should load all active jobs from the database.
- [ ] For each active job, use `node-cron` to schedule its execution based on its `cron_schedule`.
- [ ] When a job is triggered by the scheduler:
    - [ ] Use `child_process.exec` to run the job's specified prompt with `gemini-cli` (e.g., `gemini-cli --prompt "<prompt_text>"`).
    - [ ] Create a new record in the `job_runs` table with a status of `'running'`.
    - [ ] Capture all `stdout` and `stderr` from the executed command.
    - [ ] Upon completion, update the corresponding `job_runs` record with a final status (`'success'` or `'failure'`), the complete output, and the end time.
- [ ] Implement dynamic scheduling to add, remove, and update jobs in `node-cron` without needing to restart the server, triggered by API calls.

## Phase 4: Frontend - Job Management UI

- [ ] Design and implement a main layout component for the application.
- [ ] Create a `JobForm` component to allow users to create and edit jobs. This form should include inputs for the job name, its cron schedule string, and a textarea for the free-text prompt.
- [ ] Implement client-side validation for the form, especially for the cron string format.
- [ ] Create a `JobsList` component that displays all configured jobs, with controls for editing and deleting them.

## Phase 5: Frontend - Timeline Visualization and Output Display

- [ ] Develop the main `TimelineView` component, which will be the default view of the application.
- [ ] Fetch job run data from the `/api/job-runs` endpoint.
- [ ] Use a timeline library (e.g., `vis-timeline-graph2d`) to render the job runs visually.
    - [ ] Each job run should be represented as an item on the timeline.
    - [ ] The items should be color-coded based on their status (e.g., green for success, red for failure).
    - [ ] The label for each item should be the name of the job.
- [ ] Add controls for navigating the timeline, such as zooming and panning through different time scales (day, week, month).
- [ ] Implement the primary feature: a "details" view for job run output.
    - [ ] When a user clicks on a job run in the timeline, a modal or side panel should appear.
    - [ ] This view must prominently and clearly display the full, captured `output` of the job run.

## Phase 6: Integration, Build, and Documentation

- [ ] Configure the Vite development server to proxy `/api` requests to the backend Express server to avoid CORS issues.
- [ ] Create a unified build and start process.
    - [ ] Add a `build` script to the frontend `package.json` to compile the React app.
    - [ ] Configure the Express server to serve the static frontend files from the `frontend/dist` directory in a production environment.
- [ ] Write a comprehensive `README.md` file with detailed instructions on how to set up the development environment, run the application, and use its features.