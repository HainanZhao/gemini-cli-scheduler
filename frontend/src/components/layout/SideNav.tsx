
import React from 'react';

interface SideNavProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

const SideNav: React.FC<SideNavProps> = ({ activeMenu, setActiveMenu }) => {
  const menuItems = [
    { id: 'Tasks', label: 'Mission Control', icon: 'icon-schedule', description: 'View and manage scheduled jobs' },
    { id: 'Schedules', label: 'Create Job', icon: 'icon-add', description: 'Schedule a new AI job' },
    { id: 'Pending Jobs', label: 'Pending', icon: 'icon-clock', description: 'Jobs waiting to run' },
    { id: 'Past Jobs', label: 'History', icon: 'icon-history', description: 'Execution timeline' }
  ];

  return (
    <div className="side-nav">
      <div className="side-nav-header">
        <div className="flex items-center gap-3">
          <span className="icon icon-robot text-2xl"></span>
          <div>
            <h2 className="side-nav-brand">Scheduler</h2>
            <p className="side-nav-subtitle">AI Job Management</p>
          </div>
        </div>
      </div>
      
      <nav className="side-nav-menu">
        <ul>
          {menuItems.map(item => (
            <li key={item.id} className="side-nav-item">
              <button 
                className={`side-nav-link ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
                title={item.description}
              >
                <span className={`icon ${item.icon} side-nav-icon`}></span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="side-nav-footer">
        <div className="flex items-center gap-2">
          <span className="icon icon-lightning text-primary-500"></span>
          <p className="side-nav-footer-text">
            Powered by Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default SideNav;
