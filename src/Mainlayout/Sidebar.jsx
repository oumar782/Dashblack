import React, { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  Target, 
  Sun, 
  ShoppingBag, 
  Landmark,
  Map, 
  Car, 
  Zap, 
  GitBranch, 
  Mail,
  Menu,
  X
} from 'lucide-react';
import './side.css';

const AfroBlackBookSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('apex');

  // CORRECTION : Chaque lien a sa propre URL unique
  const menuItems = [
    { id: 'apex', name: 'Apex', href: '/apex', icon: Home },
    { id: 'ressources', name: 'Ressources', href: '/ressources', icon: BookOpen },
    { id: 'evenements', name: 'Événements', href: '/Event', icon: Calendar },
    { id: 'defis', name: 'Défis', href: '/defis', icon: Target },
    { id: 'the-sun', name: 'The Sun', href: '/Priere', icon: Sun },
    { id: 'boutique', name: 'Boutique', href: '/boutique', icon: ShoppingBag },
    { id: 'musee', name: 'Musée', href: '/musee', icon: Landmark },
    { id: 'tourisme', name: 'Tourisme', href: '/tourisme', icon: Map },
    { id: 'lada', name: 'Lada', href: '/Lada', icon: Car },
    { id: 'cameleon', name: 'Caméléon', href: '/Cameleon', icon: Zap },
    { id: 'fracture', name: 'Fracture', href: '/Fracture', icon: GitBranch },
    { id: 'contact', name: 'Contact', href: '/contact', icon: Mail }
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = (itemId, href) => {
    setActiveMenu(itemId);
    // Si vous utilisez React Router:
    // navigate(href);
    
    // Si vous n'utilisez pas React Router:
    window.location.href = href;
  };

  return (
    <div className="app-container">
      {/* Bouton menu mobile */}
      <button className="menu-toggle" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay pour mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        
        {/* En-tête avec logo */}
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <BookOpen size={28} color="#e25822" />
            </div>
            <div className="logo-text">
              <span className="app-name">Afro Black Book</span>
              <span className="app-tagline">Cultural Heritage</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id} className="nav-item">
                  <a 
                    href={item.href}
                    className={`nav-link ${activeMenu === item.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.id, item.href);
                    }}
                  >
                    <div className="nav-icon">
                      <IconComponent size={20} />
                    </div>
                    <span className="nav-text">{item.name}</span>
                    {activeMenu === item.id && (
                      <div className="active-indicator"></div>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer du sidebar */}
        <div className="sidebar-footer">
          <div className="accent-line"></div>
          <div className="footer-text">
            <span>Explore • Discover • Connect</span>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
     
    </div>
  );
};

export default AfroBlackBookSidebar;