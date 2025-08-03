# Gemini CLI Scheduler

A professional, modern web application for scheduling and managing AI-powered tasks using Google's Gemini CLI. Built with React, TypeScript, and Node.js with a beautiful, responsive interface.

![Gemini CLI Scheduler](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express%205.1.0-green)

## ✨ Features

### 🤖 AI-Powered Automation
- **Gemini AI Integration**: Execute AI prompts on schedule using Google's Gemini CLI
- **Prompt Testing**: Test your AI prompts immediately before scheduling
- **Flexible Prompting**: Support for any text-based AI task or analysis

### ⏰ Advanced Scheduling
- **User-Friendly Interface**: Non-technical scheduling with preset options
- **Cron Support**: Full cron expression support for advanced users
- **Real-Time Management**: Start, pause, and manage jobs instantly

### 📊 Comprehensive Monitoring
- **Execution Timeline**: Visual history of all job runs
- **Status Tracking**: Real-time status updates (Running, Success, Failed)
- **Performance Metrics**: Duration tracking and success rates
- **Detailed Logs**: Full output capture and error reporting

### 🎨 Modern User Interface
- **Professional Design**: Clean, modern interface inspired by leading tools
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Modern Icons**: Contemporary icon system with intuitive navigation
- **Dark/Light Themes**: Adaptive design with professional color schemes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini CLI installed and configured

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HainanZhao/gemini-cli-scheduler.git
   cd gemini-cli-scheduler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── JobForm.tsx      # Job creation form
│   │   ├── JobsList.tsx     # Job management interface
│   │   ├── PromptTester.tsx # AI prompt testing
│   │   ├── TimelineView.tsx # Execution history
│   │   ├── ScheduleSelector.tsx # User-friendly scheduling
│   │   └── layout/          # Layout components
│   ├── styles/              # CSS modules and design system
│   │   ├── modern.css       # Professional design system
│   │   └── Layout.css       # Layout-specific styles
│   └── App.tsx              # Main application component
```

### Backend (Node.js + Express)
```
backend/
├── src/
│   ├── routes/              # API endpoints
│   │   ├── jobs.js          # Job CRUD operations
│   │   ├── jobRuns.js       # Execution history
│   │   └── testPrompt.js    # Prompt testing
│   ├── database/            # Database operations
│   │   ├── db.js           # SQLite connection
│   │   └── setup.js        # Schema initialization
│   ├── scheduler.js         # Cron job management
│   └── index.js            # Express server
```

### Database Schema (SQLite)
- **jobs**: Store scheduled tasks with cron expressions and AI prompts
- **job_runs**: Track execution history with status and output

## 🛠️ Production Deployment

### Build for Production

1. **Build frontend**
   ```bash
   cd frontend && npm run build
   ```

2. **Test production build**
   ```bash
   npm run preview
   ```

3. **Start production server**
   ```bash
   npm run start
   ```

### Environment Configuration

Create `.env` files for production:

**Backend `.env`:**
```env
NODE_ENV=production
PORT=3001
DATABASE_PATH=/path/to/production/scheduler.db
GEMINI_CLI_PATH=/usr/local/bin/gemini
```

**Frontend `.env.production`:**
```env
VITE_API_URL=https://your-domain.com/api
```

## 📱 User Guide

### Creating Your First Job

1. **Navigate to "Create Job"** in the sidebar
2. **Enter a descriptive name** for your task
3. **Choose a schedule** using the friendly interface or custom cron
4. **Write your AI prompt** describing the task
5. **Test the prompt** using the built-in tester
6. **Save and activate** the job

### Managing Jobs

- **View all jobs** in the Tasks section
- **Edit inline** by clicking the edit button
- **Pause/Resume** jobs with the play/pause toggle
- **Delete jobs** that are no longer needed
- **Monitor execution** in the History timeline

## 🔧 Development

### Project Structure

The application follows modern best practices:

- **TypeScript**: Full type safety across the codebase
- **Component Architecture**: Modular, reusable React components
- **Design System**: Consistent styling with CSS custom properties
- **API Design**: RESTful endpoints with proper error handling
- **Database Management**: SQLite with automatic migrations

### Key Technologies

- **Frontend**: React 19.1.0, TypeScript 5.6.2, Vite 7.0.6
- **Backend**: Node.js, Express 5.1.0, node-cron 4.2.1
- **Database**: SQLite with better-sqlite3 12.2.0
- **Styling**: Modern CSS with design tokens
- **Build**: Vite with optimized production builds

---

**Built with ❤️ for modern AI automation workflows**
