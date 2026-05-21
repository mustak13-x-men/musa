import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchExpenses, fetchGoals, getAISuggestions } from '../api';
import { 
  TrendingDown, 
  TrendingUp, 
  Wallet, 
  Brain, 
  ArrowUpRight, 
  DollarSign, 
  Sparkles,
  Receipt,
  PieChart as ChartIcon,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Travel: '#3b82f6',
  Shopping: '#ec4899',
  Bills: '#6366f1',
  Entertainment: '#8b5cf6',
  Health: '#10b981',
  Education: '#14b8a6'
};

const Dashboard = () => {
  const [currency, setCurrency] = useState(localStorage.getItem('app_currency') || '₹');
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Quick stats
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [healthScore, setHealthScore] = useState(85);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch concurrent API data
      const [expensesData, goalsData, aiData] = await Promise.all([
        fetchExpenses(),
        fetchGoals(),
        getAISuggestions().catch(err => {
          console.error("AI Insights fetch failed on dashboard load, utilizing backup", err);
          return null;
        })
      ]);

      setExpenses(expensesData);
      setGoals(goalsData);
      
      if (aiData) {
        setAiAnalysis(aiData);
      }

      // Calculations
      const totalExp = expensesData.reduce((sum, item) => sum + item.amount, 0);
      setTotalSpent(totalExp);

      const totalSav = goalsData.reduce((sum, item) => sum + item.saved_amount, 0);
      setTotalSaved(totalSav);

      // Financial Health Index math:
      // Ratio of Savings to Expenses. High ratio yields higher score, up to 100.
      let score = 50; // base score
      if (totalExp === 0 && totalSav > 0) score = 100;
      else if (totalExp > 0) {
        const ratio = totalSav / totalExp;
        if (ratio >= 1.0) score = 95;
        else if (ratio >= 0.5) score = 85;
        else if (ratio >= 0.2) score = 70;
        else score = 45;
      }
      
      // Deduct slightly for any warning flags
      if (aiData && aiData.warnings && aiData.warnings.length > 0) {
        score = Math.max(30, score - (aiData.warnings.length * 5));
      }
      setHealthScore(score);

    } catch (err) {
      console.error("Error loading dashboard metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Re-verify currency changes
    const onCurrencyChange = () => {
      setCurrency(localStorage.getItem('app_currency') || '₹');
    };
    window.addEventListener('currencyChange', onCurrencyChange);
    return () => window.removeEventListener('currencyChange', onCurrencyChange);
  }, []);

  // Format charts collections
  const getDoughnutData = () => {
    const categoryBreakdown = {};
    expenses.forEach(exp => {
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
    });

    const categories = Object.keys(categoryBreakdown);
    const amounts = Object.values(categoryBreakdown);
    const colors = categories.map(cat => CATEGORY_COLORS[cat] || '#6b7280');

    return {
      labels: categories,
      datasets: [
        {
          data: amounts,
          backgroundColor: colors,
          borderColor: 'rgba(11, 15, 25, 0.8)',
          borderWidth: 2,
          hoverOffset: 12,
        },
      ],
    };
  };

  const getLineData = () => {
    // Group expenses by date and aggregate
    const dateAggregates = {};
    expenses.slice().reverse().forEach(exp => {
      const d = exp.date; // formatted as YYYY-MM-DD
      dateAggregates[d] = (dateAggregates[d] || 0) + exp.amount;
    });

    const dates = Object.keys(dateAggregates).slice(-7); // take last 7 active transaction days
    const amounts = Object.values(dateAggregates).slice(-7);

    return {
      labels: dates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          fill: true,
          label: 'Spent Amount',
          data: amounts,
          borderColor: '#6366f1',
          borderWidth: 3,
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          pointBackgroundColor: '#6366f1',
          pointHoverRadius: 8,
          tension: 0.35,
        },
      ],
    };
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleFont: { family: 'Outfit', weight: 'bold' },
        bodyFont: { family: 'Outfit' },
        padding: 12,
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { family: 'Outfit', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9ca3af', font: { family: 'Outfit', size: 11 } }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#f3f4f6',
          font: { family: 'Outfit', size: 12, weight: 600 },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: '#111827',
        bodyFont: { family: 'Outfit' },
        padding: 10,
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1
      }
    },
    cutout: '65%'
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Summary Cards row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Expenses Card */}
        <div className="glass-panel glass-panel-hoverable" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid var(--accent)' }}>
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--accent)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Spent</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '2px' }}>
              {currency}{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* Savings Card */}
        <div className="glass-panel glass-panel-hoverable" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--secondary)' }}>
            <Wallet size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Savings</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '2px' }}>
              {currency}{totalSaved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="glass-panel glass-panel-hoverable" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--primary)' }}>
            <Receipt size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Goals</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '2px' }}>
              {goals.length} Goals
            </h3>
          </div>
        </div>

        {/* Health Index Card */}
        <div className="glass-panel glass-panel-hoverable" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid #a78bfa' }}>
          <div style={{ background: 'rgba(167, 139, 250, 0.1)', padding: '0.75rem', borderRadius: '12px', color: '#a78bfa' }}>
            <ShieldCheck size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Spend Safety Rating</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '2px' }}>
                {healthScore}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
              </h3>
              <span className={`badge ${healthScore >= 80 ? 'badge-success' : healthScore >= 60 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem', marginLeft: 'auto' }}>
                {healthScore >= 80 ? 'Safe' : healthScore >= 60 ? 'Caution' : 'Volatile'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main analytical charts grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1.5rem'
      }}>
        {/* Line graph trend */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Transaction Velocity (Last 7 Active Days)</h3>
            <span className="badge badge-primary">Dynamic Graph</span>
          </div>
          <div style={{ height: '300px', position: 'relative' }}>
            {expenses.length > 0 ? (
              <Line data={getLineData()} options={lineOptions} />
            ) : (
              <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.9rem' }}>Not enough transaction history to draw spending curves.</p>
                <Link to="/expenses" style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>Add Expense Log</Link>
              </div>
            )}
          </div>
        </div>

        {/* Doughnut category distribution */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Category Share</h3>
            <ChartIcon size={16} color="var(--text-secondary)" />
          </div>
          <div style={{ height: '300px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {expenses.length > 0 ? (
              <Doughnut data={getDoughnutData()} options={doughnutOptions} />
            ) : (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Add expenses to verify distribution.</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bottom Grid: Recent Transactions and AI Insights widget */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '1.5rem'
      }}>
        {/* Recent Transactions List */}
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Outflows</h3>
              <Link to="/expenses" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>Manage Logs</span>
                <ChevronRight size={14} />
              </Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {expenses.length > 0 ? (
                expenses.slice(0, 5).map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: `${CATEGORY_COLORS[item.category] || '#6b7280'}15`,
                        color: CATEGORY_COLORS[item.category] || '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem'
                      }}>
                        {item.category.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.title}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fb7185' }}>
                        -{currency}{item.amount.toFixed(2)}
                      </h4>
                      <span className="badge" style={{
                        fontSize: '0.65rem',
                        padding: '0 0.35rem',
                        background: 'transparent',
                        borderColor: CATEGORY_COLORS[item.category] || '#6b7280',
                        color: CATEGORY_COLORS[item.category] || '#6b7280',
                        borderStyle: 'solid',
                        borderWidth: '1px'
                      }}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No historical transactions found. Add records in Expenses tab!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insight Smart Coach Preview */}
        <div className="glass-panel" style={{
          padding: '1.75rem',
          background: 'radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.15) 0%, rgba(17, 24, 43, 0.65) 60%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Brain size={22} color="var(--primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.25px' }}>
                AI Coach Insights
              </h3>
              <span className="badge badge-primary" style={{ marginLeft: 'auto', background: 'rgba(99,102,241,0.25)' }}>
                Active Coach
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {aiAnalysis && aiAnalysis.insights && aiAnalysis.insights.length > 0 ? (
                aiAnalysis.insights.slice(0, 3).map((tip, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      marginTop: '3px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      padding: '4px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Sparkles size={12} color="var(--primary)" />
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4, fontWeight: 500 }}>
                      {tip}
                    </p>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '1rem 0' }}>
                  AI Financial Analysis engine is compiling metrics. Add more data to start forecasting insights!
                </div>
              )}
            </div>
          </div>

          <Link to="/ai-insights" className="btn btn-primary" style={{ width: '100%', gap: '0.5rem', padding: '0.8rem' }}>
            <span>Consult AI Coach Terminal</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
