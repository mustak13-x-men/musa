import React, { useState, useEffect } from 'react';
import { getAISuggestions, getAIPredictions, fetchExpenses, fetchGoals } from '../api';
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckSquare, 
  Square,
  FileDown, 
  Clock, 
  BadgePercent,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AIInsights = () => {
  const [currency, setCurrency] = useState(localStorage.getItem('app_currency') || '₹');
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [rawExpenses, setRawExpenses] = useState([]);
  const [rawGoals, setRawGoals] = useState([]);
  const [error, setError] = useState('');
  
  // Action checklist checkboxes state
  const [checkedActions, setCheckedActions] = useState({});

  const loadAIModuleData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [aiData, predictData, expensesData, goalsData] = await Promise.all([
        getAISuggestions(),
        getAIPredictions(),
        fetchExpenses(),
        fetchGoals()
      ]);

      setAnalysis(aiData);
      setPredictions(predictData);
      setRawExpenses(expensesData);
      setRawGoals(goalsData);

      // Pre-initialize checklist checkboxes
      if (aiData && aiData.suggestions) {
        const initialChecks = {};
        aiData.suggestions.forEach((_, idx) => {
          initialChecks[idx] = false;
        });
        setCheckedActions(initialChecks);
      }

    } catch (err) {
      console.error(err);
      setError('AI analytics models are launching. Please verify server connection!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAIModuleData();

    const onCurrencyChange = () => {
      setCurrency(localStorage.getItem('app_currency') || '₹');
    };
    window.addEventListener('currencyChange', onCurrencyChange);
    return () => window.removeEventListener('currencyChange', onCurrencyChange);
  }, []);

  const toggleCheck = (idx) => {
    setCheckedActions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Compile Bar chart dataset for Category Current vs Forecasted values
  const getForecastChartData = () => {
    if (!rawExpenses || !predictions || !predictions.category_forecast) {
      return { labels: [], datasets: [] };
    }

    // Group actual current spending
    const currentCategoryTotals = {};
    rawExpenses.forEach(exp => {
      currentCategoryTotals[exp.category] = (currentCategoryTotals[exp.category] || 0) + exp.amount;
    });

    const categories = Object.keys(predictions.category_forecast);
    const forecastAmounts = categories.map(cat => predictions.category_forecast[cat] || 0);
    const currentAmounts = categories.map(cat => currentCategoryTotals[cat] || 0);

    return {
      labels: categories,
      datasets: [
        {
          label: 'Current Month Spent',
          data: currentAmounts,
          backgroundColor: 'rgba(99, 102, 241, 0.4)',
          borderColor: 'rgba(99, 102, 241, 0.8)',
          borderWidth: 1.5,
          borderRadius: 8
        },
        {
          label: 'AI Forecasted Spending',
          data: forecastAmounts,
          backgroundColor: 'rgba(16, 185, 129, 0.55)',
          borderColor: 'rgba(16, 185, 129, 0.9)',
          borderWidth: 1.5,
          borderRadius: 8
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#f3f4f6',
          font: { family: 'Outfit', size: 12, weight: 600 }
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

  // Compile styled PDF Report Print view
  const handleDownloadPDFReport = () => {
    // Generate isolated window for a beautiful structured invoice-style print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker is active. Please allow pop-ups to print PDF reports!');
      return;
    }

    const totalSpent = rawExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalSaved = rawGoals.reduce((sum, g) => sum + g.saved_amount, 0);

    const reportContent = `
      <html>
        <head>
          <title>AI Smart Spend Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937; padding: 30px; line-height: 1.5; }
            .header { border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .header h1 { margin: 0; color: #4f46e5; font-size: 24px; }
            .header p { margin: 5px 0 0 0; color: #6b7280; font-size: 12px; }
            .kpis { display: flex; gap: 20px; margin-bottom: 30px; }
            .kpi-card { flex: 1; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; background: #f9fafb; }
            .kpi-card span { font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: bold; }
            .kpi-card h3 { margin: 5px 0 0 0; font-size: 20px; color: #111827; }
            .section-title { font-size: 16px; font-weight: bold; color: #111827; margin: 25px 0 10px 0; border-left: 4px solid #6366f1; padding-left: 8px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f3f4f6; color: #374151; text-align: left; padding: 10px; font-size: 12px; border-bottom: 1px solid #e5e7eb; }
            td { padding: 10px; font-size: 12px; border-bottom: 1px solid #f3f4f6; }
            .warning { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; padding: 10px; border-radius: 6px; font-size: 12px; margin-bottom: 10px; }
            .ai-tips { background: #f5f3ff; border: 1px solid #ddd6fe; color: #6d28d9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .ai-tips ul { margin: 5px 0 0 0; padding-left: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>AI SMART SPEND REPORT</h1>
              <p>Prepared for: Vault User</p>
            </div>
            <div style="text-align: right;">
              <p>Generated: ${new Date().toLocaleString()}</p>
              <p>Currency Base: ${currency}</p>
            </div>
          </div>

          <div class="kpis">
            <div class="kpi-card">
              <span>Total Outflow Ledger</span>
              <h3>${currency}${totalSpent.toFixed(2)}</h3>
            </div>
            <div class="kpi-card">
              <span>Total Capital Saved</span>
              <h3>${currency}${totalSaved.toFixed(2)}</h3>
            </div>
            <div class="kpi-card">
              <span>Projected Next Month Cost</span>
              <h3>${currency}${predictions?.prediction ? predictions.prediction.toFixed(2) : '0.00'}</h3>
            </div>
          </div>

          ${analysis?.warnings && analysis.warnings.length > 0 ? `
            <div class="section-title">Critical Alerts</div>
            ${analysis.warnings.map(w => `<div class="warning">⚠️ ${w}</div>`).join('')}
          ` : ''}

          <div class="section-title">AI Financial Advice & Recommendations</div>
          <div class="ai-tips">
            <strong>Key Tips from your AI Coach:</strong>
            <ul>
              ${analysis?.insights ? analysis.insights.map(tip => `<li>${tip}</li>`).join('') : '<li>Update transactions to log AI advice.</li>'}
            </ul>
          </div>

          <div class="section-title">Ledger Transaction History</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rawExpenses.map(item => `
                <tr>
                  <td>${item.date}</td>
                  <td><strong>${item.title}</strong></td>
                  <td>${item.category}</td>
                  <td>${item.description || '-'}</td>
                  <td style="color: #ef4444; font-weight: bold;">-${currency}${item.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">Savings Targets Tracker</div>
          <table>
            <thead>
              <tr>
                <th>Savings Goal</th>
                <th>Target Amount</th>
                <th>Saved Amount</th>
                <th>Completion Ratio</th>
                <th>Suggested Monthly Contribution</th>
              </tr>
            </thead>
            <tbody>
              ${rawGoals.map(item => `
                <tr>
                  <td><strong>${item.goal_name}</strong></td>
                  <td>${currency}${item.target_amount.toLocaleString()}</td>
                  <td>${currency}${item.saved_amount.toLocaleString()}</td>
                  <td style="color: #10b981; font-weight: bold;">${item.progress_percent}%</td>
                  <td>${currency}${item.suggested_monthly_saving}/mo</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(reportContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Visual top projection bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 2fr',
        gap: '2rem'
      }}>
        
        {/* Next month predictive spend widget */}
        <div className="glass-panel" style={{
          padding: '2rem',
          background: 'radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.15) 0%, rgba(17, 24, 43, 0.65) 60%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <BrainCircuit size={22} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Spending Projection</h3>
              {predictions?.source && (
                <span className="badge badge-primary" style={{ marginLeft: 'auto', background: 'rgba(99,102,241,0.25)' }}>
                  Active Model
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '1.5rem' }}>
              Our analytical models project next month's total spent capital based on recent velocity frequencies.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                Forecasted Outflow
              </span>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '2px' }} className="gradient-text">
                {currency}{predictions?.prediction ? predictions.prediction.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
              </h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} color="var(--warning)" />
                  Confidence
                </span>
                <span className={`badge ${predictions?.confidence === 'high' ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: '0.25rem', display: 'inline-block', textTransform: 'capitalize' }}>
                  {predictions?.confidence || 'medium'}
                </span>
              </div>
              
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Activity size={12} color="var(--secondary)" />
                  History Base
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                  {rawExpenses.length} Logs
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              💡 <strong>Model Analysis:</strong> {predictions?.explanation}
            </p>
          </div>
        </div>

        {/* Predictive charts */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Current vs AI Projections</h3>
          <div style={{ height: '280px', position: 'relative' }}>
            {rawExpenses.length > 0 ? (
              <Bar data={getForecastChartData()} options={chartOptions} />
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', paddingTop: '6rem' }}>
                Forecast chart will compile as soon as you record transactions.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Middle Grid: Warnings alerts and Actions Checklist */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1.8fr',
        gap: '2rem'
      }}>
        
        {/* Critical Warnings */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <AlertTriangle size={20} color="var(--accent)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Security & Budget Flags</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {analysis && analysis.warnings && analysis.warnings.length > 0 ? (
              analysis.warnings.map((warn, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'rgba(244, 63, 94, 0.05)',
                  border: '1px solid rgba(244, 63, 94, 0.15)',
                  color: '#fb7185',
                  fontSize: '0.85rem',
                  lineHeight: 1.4,
                  fontWeight: 500
                }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{warn}</span>
                </div>
              ))
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '2.5rem 1rem',
                color: 'var(--text-secondary)',
                border: '1px dashed var(--glass-border)',
                borderRadius: '12px'
              }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>All category budgets are healthy! No overspending flag raised.</p>
              </div>
            )}
          </div>
        </div>

        {/* Actionable Coach checklist */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Coaches Action Checklist</h3>
          </div>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Adopt these customized habits designed by your AI Coach based on your actual expenditure data.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {analysis && analysis.suggestions && analysis.suggestions.length > 0 ? (
              analysis.suggestions.map((action, index) => {
                const isChecked = !!checkedActions[index];
                return (
                  <div 
                    key={index}
                    onClick={() => toggleCheck(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      borderRadius: '14px',
                      background: isChecked ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                      border: isChecked ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid var(--glass-border)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ color: isChecked ? 'var(--secondary)' : 'var(--text-muted)' }}>
                      {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                    </div>
                    <p style={{ 
                      fontSize: '0.85rem', 
                      color: isChecked ? 'var(--text-secondary)' : 'var(--text-primary)', 
                      fontWeight: 600,
                      lineHeight: 1.4,
                      textDecoration: isChecked ? 'line-through' : 'none'
                    }}>
                      {action}
                    </p>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '1rem 0' }}>
                AI is auditing records. Check back as soon as transactions are registered.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Downloader bottom center */}
      <div className="glass-panel" style={{
        padding: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.06) 0%, rgba(17, 24, 43, 0.65) 100%)'
      }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Download Audited Financial Ledger</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Compile your transactions, savings progress, and AI recommendations into a beautifully structured PDF document.
          </p>
        </div>

        <button 
          onClick={handleDownloadPDFReport}
          className="btn btn-primary"
          style={{ gap: '0.75rem', padding: '0.85rem 1.5rem', borderRadius: '12px' }}
        >
          <FileDown size={18} />
          <span>Export PDF Report</span>
        </button>
      </div>

    </div>
  );
};

export default AIInsights;
