import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Target, 
  BrainCircuit, 
  LogOut, 
  Sparkles,
  TrendingUp
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: ReceiptText },
    { name: 'Savings Planner', path: '/savings', icon: Target },
    { name: 'AI Insights', path: '/ai-insights', icon: BrainCircuit }
  ];

  return (
    <aside className="glass-panel" style={{
      width: '280px',
      height: 'calc(100vh - 2rem)',
      margin: '1rem',
      position: 'sticky',
      top: '1rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '2rem 1.5rem',
      zIndex: 50,
      borderRadius: '24px'
    }}>
      {/* Brand logo */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2.5rem',
          padding: '0 0.5rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
            padding: '0.6rem',
            borderRadius: '12px',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Antigravity <span className="gradient-text">Spend</span>
            </h2>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '1px' }}>
              AI Smart Tracker
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.9rem 1.25rem',
                  borderRadius: '14px',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User profile and logout */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        borderTop: '1px solid var(--glass-border)',
        paddingTop: '1.5rem'
      }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.25rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.1rem',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.username}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.email}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="btn btn-outline"
          style={{
            width: '100%',
            justifyContent: 'flex-start',
            gap: '0.75rem',
            padding: '0.8rem 1.25rem',
            borderRadius: '14px',
            fontSize: '0.9rem',
            borderColor: 'rgba(244, 63, 94, 0.15)',
            color: '#fb7185'
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Embedded local CSS rules for link active styles */}
      <style>{`
        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary) !important;
          transform: translateX(4px);
        }
        .sidebar-link.active {
          background: rgba(99, 102, 241, 0.15) !important;
          color: #818cf8 !important;
          border: 1px solid rgba(99, 102, 241, 0.25);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.08);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
