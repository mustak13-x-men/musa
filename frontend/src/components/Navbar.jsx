import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Calendar, ChevronDown, CheckCircle, AlertTriangle, Coins } from 'lucide-react';
import { fetchExpenses, fetchGoals } from '../api';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [currency, setCurrency] = useState(localStorage.getItem('app_currency') || '₹');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { main: 'Dashboard Overview', desc: 'Welcome back! Here is a summary of your financial health.' };
      case '/expenses':
        return { main: 'Expense Management', desc: 'Add, review, and filter your daily expenditures.' };
      case '/savings':
        return { main: 'Savings Goal Planner', desc: 'Track your milestones and model monthly saving ratios.' };
      case '/ai-insights':
        return { main: 'AI Financial Coach', desc: 'Unlock predictive budget reports and overspending alerts.' };
      default:
        return { main: 'Control Center', desc: 'Manage your financial parameters.' };
    }
  };

  const handleCurrencyChange = (e) => {
    const selected = e.target.value;
    localStorage.setItem('app_currency', selected);
    setCurrency(selected);
    // Dispatch custom event to notify other components instantly
    window.dispatchEvent(new Event('currencyChange'));
  };

  // Compile active alerts dynamically
  useEffect(() => {
    const generateAlerts = async () => {
      if (!user) return;
      try {
        const alertsList = [];
        
        // 1. Fetch Expenses to see if they are high
        const expenses = await fetchExpenses();
        const total = expenses.reduce((sum, item) => sum + item.amount, 0);
        
        if (total > 50000) {
          alertsList.push({
            id: 'alert-budget',
            type: 'warning',
            text: `High spending detected! Monthly expenses exceed ${currency}50,000. Consider auditing categories.`,
            time: 'Just now'
          });
        }

        // Check if Shopping exceeds 35% of total spending
        const shoppingTotal = expenses
          .filter(e => e.category === 'Shopping')
          .reduce((sum, item) => sum + item.amount, 0);
        if (total > 0 && (shoppingTotal / total) > 0.35) {
          alertsList.push({
            id: 'alert-shopping',
            type: 'warning',
            text: `Alert: Shopping consumes ${(shoppingTotal / total * 100).toFixed(0)}% of your total spending!`,
            time: '10m ago'
          });
        }

        // 2. Fetch savings goals to see if there are deadlines within 30 days
        const goals = await fetchGoals();
        goals.forEach(goal => {
          if (goal.progress_percent >= 100) {
            alertsList.push({
              id: `alert-goal-done-${goal.id}`,
              type: 'success',
              text: `Congratulations! Goal '${goal.goal_name}' has been successfully completed!`,
              time: '1h ago'
            });
          } else {
            const deadline = new Date(goal.deadline);
            const diffDays = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
            if (diffDays > 0 && diffDays <= 30) {
              alertsList.push({
                id: `alert-goal-warn-${goal.id}`,
                type: 'info',
                text: `Reminder: The deadline for goal '${goal.goal_name}' is in ${diffDays} days!`,
                time: '2h ago'
              });
            }
          }
        });

        // If no alerts exist, add a helpful greeting
        if (alertsList.length === 0) {
          alertsList.push({
            id: 'alert-welcome',
            type: 'success',
            text: `All budgets are healthy! Keep updating your transactions daily.`,
            time: '1d ago'
          });
        }

        setNotifications(alertsList);
        setUnreadCount(alertsList.length);

      } catch (err) {
        console.error("Error generating notifications alerts", err);
      }
    };

    generateAlerts();

    // Listen to local currency adjustments
    const onCurrencyChange = () => {
      setCurrency(localStorage.getItem('app_currency') || '₹');
    };
    window.addEventListener('currencyChange', onCurrencyChange);
    return () => window.removeEventListener('currencyChange', onCurrencyChange);

  }, [user]);

  const titles = getPageTitle();

  return (
    <nav className="glass-panel" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.25rem 2rem',
      marginBottom: '2rem',
      borderRadius: '20px',
      position: 'relative'
    }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{titles.main}</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{titles.desc}</p>
      </div>

      {/* Toolbar actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        
        {/* Currency selector widget */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          padding: '0.5rem 0.75rem',
        }}>
          <Coins size={15} color="var(--primary)" />
          <select 
            value={currency} 
            onChange={handleCurrencyChange}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="₹">INR (₹)</option>
            <option value="$">USD ($)</option>
            <option value="€">EUR (€)</option>
            <option value="£">GBP (£)</option>
          </select>
        </div>

        {/* Calendar widget */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          fontWeight: 600,
          background: 'var(--bg-tertiary)',
          padding: '0.5rem 0.85rem',
          borderRadius: '12px',
          border: '1px solid var(--glass-border)',
          whiteSpace: 'nowrap'
        }}>
          <Calendar size={15} color="var(--secondary)" />
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        {/* Notifications center */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setUnreadCount(0);
            }}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '0.6rem',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              transition: 'all var(--transition-fast)'
            }}
            className="navbar-tool-btn"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px var(--accent-glow)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown menu */}
          {showNotifications && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '125%',
              right: 0,
              width: '340px',
              padding: '1.25rem',
              borderRadius: '16px',
              zIndex: 100,
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--glass-border)',
                paddingBottom: '0.75rem'
              }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Dynamic Budget Alerts</h4>
                <span className="badge badge-primary">{notifications.length} Info</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)'
                  }}>
                    <div style={{ marginTop: '2px' }}>
                      {item.type === 'warning' ? (
                        <AlertTriangle size={15} color="var(--warning)" />
                      ) : (
                        <CheckCircle size={15} color="var(--secondary)" />
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                        {item.text}
                      </p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        {item.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navbar-tool-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--text-muted);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
