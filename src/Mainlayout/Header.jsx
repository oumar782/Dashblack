import React, { useState } from 'react';
import { Search, Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import './head.css';
const AfroBlackBookHeader = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const user = {
    name: 'John Doe',
    role: 'Administrator',
    avatar: '/api/placeholder/40/40'
  };

  const notifications = [
    { id: 1, text: 'Nouvel événement disponible', time: '5 min' },
    { id: 2, text: 'Message de la communauté', time: '1h' }
  ];

  return (
    <header className="header">
      {/* Section gauche - Recherche */}
      <div className="header-left">
    
      </div>

      {/* Section droite - Actions utilisateur */}
      <div className="header-right">
        {/* Notifications */}
        <div className="notification-wrapper">
          <button className="icon-button notification-button">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
        </div>

        {/* Séparateur */}
        <div className="header-divider"></div>

        {/* Profil utilisateur */}
        <div className="profile-container">
          <button 
            className="profile-button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="avatar">
              <User size={20} />
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <ChevronDown size={16} className={`dropdown-arrow ${isProfileOpen ? 'rotated' : ''}`} />
          </button>

          {/* Dropdown menu */}
          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  <User size={24} />
                </div>
                <div className="dropdown-user-info">
                  <span className="dropdown-name">{user.name}</span>
                  <span className="dropdown-role">{user.role}</span>
                </div>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <div className="dropdown-menu">
                <button className="dropdown-item">
                  <User size={18} />
                  <span>Mon Profil</span>
                </button>
                <button className="dropdown-item">
                  <Settings size={18} />
                  <span>Paramètres</span>
                </button>
                
                <div className="dropdown-divider"></div>
                
                <button className="dropdown-item logout">
                  <LogOut size={18} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AfroBlackBookHeader;