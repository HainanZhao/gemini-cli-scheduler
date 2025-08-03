import { useState } from 'react';
import JobForm from './components/JobForm';
import JobsList from './components/JobsList';
import TimelineView from './components/TimelineView';
import SideNav from './components/layout/SideNav';
import './styles/modern.css';
import './styles/Layout.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeMenu, setActiveMenu] = useState('Tasks');

  const handleDataChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const getPageTitle = () => {
    switch (activeMenu) {
      case 'Tasks':
        return { 
          title: 'Mission Control', 
          subtitle: 'Your central command center for managing all scheduled AI jobs. Monitor, edit, and control job execution.', 
          icon: 'icon-schedule' 
        };
      case 'Schedules':
        return { 
          title: 'Create New Job', 
          subtitle: 'Schedule a new AI-powered job with custom prompts and flexible timing options.', 
          icon: 'icon-add' 
        };
      case 'Pending Jobs':
        return { 
          title: 'Pending Jobs', 
          subtitle: 'Jobs that are scheduled to run in the future. Monitor upcoming executions.', 
          icon: 'icon-clock' 
        };
      case 'Past Jobs':
        return { 
          title: 'Execution History', 
          subtitle: 'Timeline and results of completed job runs. Review AI outputs and performance.', 
          icon: 'icon-history' 
        };
      default:
        return { 
          title: 'AI Job Scheduler', 
          subtitle: 'Automate your AI tasks with flexible scheduling', 
          icon: 'icon-lightning' 
        };
    }
  };

  const renderContent = () => {
    const pageInfo = getPageTitle();
    
    return (
      <div className="w-full">
        <div className="flex items-center gap-4 mb-8">
          <div className={`icon icon-xl ${pageInfo.icon}`}></div>
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">{pageInfo.title}</h1>
            <p className="text-secondary">{pageInfo.subtitle}</p>
          </div>
        </div>
        
        {(() => {
          switch (activeMenu) {
            case 'Tasks':
              return <JobsList 
                refreshTrigger={refreshTrigger} 
                onJobsChange={handleDataChange} 
                onNavigateToCreate={() => setActiveMenu('Schedules')}
              />;
            case 'Schedules':
              return <JobForm onJobCreated={handleDataChange} />;
            case 'Pending Jobs':
              return (
                <div className="card fade-in">
                  <div className="card-body">
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <div className="icon icon-clock text-6xl mb-6 text-warning-500"></div>
                      <h3 className="text-2xl font-semibold mb-3 text-primary">Pending Jobs</h3>
                      <p className="text-secondary text-lg">Feature coming soon - view jobs waiting to execute</p>
                    </div>
                  </div>
                </div>
              );
            case 'Past Jobs':
              return <TimelineView refreshTrigger={refreshTrigger} />;
            default:
              return <JobsList 
                refreshTrigger={refreshTrigger} 
                onJobsChange={handleDataChange}
                onNavigateToCreate={() => setActiveMenu('Schedules')}
              />;
          }
        })()}
      </div>
    );
  };

  return (
    <div className="app-container">
      <SideNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="main-content">
        <header className="App-header">
          <div className="logo">
            <span className="icon icon-lightning"></span>
            Gemini CLI Scheduler
          </div>
        </header>
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;
