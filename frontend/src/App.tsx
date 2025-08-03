import { useState } from 'react';
import JobForm from './components/JobForm';
import JobsList from './components/JobsList';
import TimelineView from './components/TimelineView';
import './App.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDataChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="App-header" style={{ 
        backgroundColor: '#282c34', 
        padding: '20px', 
        color: 'white', 
        textAlign: 'center' 
      }}>
        <h1>Gemini CLI Scheduler</h1>
        <p>Schedule and monitor AI agent jobs</p>
      </header>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <JobForm onJobCreated={handleDataChange} />
        <JobsList refreshTrigger={refreshTrigger} onJobsChange={handleDataChange} />
        <TimelineView refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}

export default App;