import React, { useState, useEffect } from 'react';
import { fetchGoals, createGoal, updateGoal, deleteGoal } from '../api';
import { 
  Plus, 
  Target, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Calendar, 
  TrendingUp, 
  Coins, 
  CheckCircle,
  Clock,
  HelpCircle,
  X
} from 'lucide-react';

const Savings = () => {
  const [currency, setCurrency] = useState(localStorage.getItem('app_currency') || '₹');
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [formGoalName, setFormGoalName] = useState('');
  const [formTargetAmount, setFormTargetAmount] = useState('');
  const [formSavedAmount, setFormSavedAmount] = useState('0');
  const [formDeadline, setFormDeadline] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [calcMonthlySaving, setCalcMonthlySaving] = useState('5000');
  const [calcResult, setCalcResult] = useState('');

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchGoals();
      setGoals(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch savings targets. Verify backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();

    const onCurrencyChange = () => {
      setCurrency(localStorage.getItem('app_currency') || '₹');
    };
    window.addEventListener('currencyChange', onCurrencyChange);
    return () => window.removeEventListener('currencyChange', onCurrencyChange);
  }, []);

  useEffect(() => {
    if (goals.length === 0) {
      setCalcResult('Add active savings goals to calculate achievements.');
      return;
    }

    const contribution = parseFloat(calcMonthlySaving);
    if (!contribution || contribution <= 0) {
      setCalcResult('Please enter a valid monthly contribution value (> 0).');
      return;
    }

    const totalRemaining = goals.reduce((sum, g) => sum + Math.max(0, g.target_amount - g.saved_amount), 0);
    if (totalRemaining === 0) {
      setCalcResult('Awesome! All your savings goals have been fully funded!');
      return;
    }

    const monthsNeeded = totalRemaining / contribution;
    const years = Math.floor(monthsNeeded / 12);
    const months = Math.round(monthsNeeded % 12);

    let resultString = `To fund all active goals (${currency}${totalRemaining.toLocaleString()}), it will take approximately `;
    if (years > 0) resultString += `${years} year(s) `;
    if (months > 0 || years === 0) resultString += `${months} month(s)`;
    
    setCalcResult(resultString + ` at your monthly rate of ${currency}${contribution.toLocaleString()}.`);

  }, [calcMonthlySaving, goals, currency]);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentEditId(null);
    setFormGoalName('');
    setFormTargetAmount('');
    setFormSavedAmount('0');
    setFormDeadline('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formGoalName || !formTargetAmount || !formDeadline) {
      setError('Please fill in all required goal details!');
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        goal_name: formGoalName,
        target_amount: parseFloat(formTargetAmount),
        saved_amount: parseFloat(formSavedAmount || 0),
        deadline: formDeadline
      };

      if (isEditing) {
        await updateGoal(currentEditId, payload);
      } else {
        await createGoal(payload);
      }

      resetForm();
      loadGoals();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit savings milestone.');
    } finally {
      setFormLoading(false);
    }
  };

  const startEdit = (item) => {
    setIsEditing(true);
    setCurrentEditId(item.id);
    setFormGoalName(item.goal_name);
    setFormTargetAmount(item.target_amount);
    setFormSavedAmount(item.saved_amount);
    setFormDeadline(item.deadline);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this savings target? Saved records will be archived.')) return;
    try {
      await deleteGoal(id);
      loadGoals();
    } catch (err) {
      console.error(err);
      setError('Failed to purge savings goal!');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.2)',
          color: '#fb7185',
          padding: '1rem',
          borderRadius: '16px',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2.2fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Target size={18} color="var(--secondary)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {isEditing ? 'Modify Target' : 'Establish Goal'}
              </h3>
              {isEditing && (
                <button onClick={resetForm} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              )}
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Goal Title*</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. New Macbook Pro"
                  value={formGoalName}
                  onChange={(e) => setFormGoalName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Cash ({currency})*</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  className="form-input"
                  placeholder="10000"
                  value={formTargetAmount}
                  onChange={(e) => setFormTargetAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Already Saved ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="0"
                  value={formSavedAmount}
                  onChange={(e) => setFormSavedAmount(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Deadline*</label>
                <input
                  type="date"
                  className="form-input"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ flex: 1, padding: '0.85rem' }}
                  disabled={formLoading}
                >
                  {formLoading ? 'Saving...' : isEditing ? 'Confirm Changes' : 'Establish Goal'}
                </button>
              </div>
            </form>
          </div>

          <div className="glass-panel" style={{
            padding: '1.75rem',
            background: 'radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.1) 0%, rgba(17, 24, 43, 0.65) 60%)',
            borderColor: 'rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Coins size={18} color="var(--secondary)" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Milestone Modeler</h4>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '1.25rem' }}>
              Model how long it will take to achieve all targets based on monthly savings velocities.
            </p>

            <div className="form-group">
              <label className="form-label">Monthly Savings Rate ({currency})</label>
              <input
                type="number"
                className="form-input"
                value={calcMonthlySaving}
                onChange={(e) => setCalcMonthlySaving(e.target.value)}
                placeholder="5000"
                style={{ borderColor: 'rgba(16, 185, 129, 0.15)' }}
              />
            </div>

            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              color: '#34d399',
              fontSize: '0.8rem',
              fontWeight: 600,
              lineHeight: 1.5
            }}>
              {calcResult}
            </div>
          </div>

        </div>

        <div className="glass-panel" style={{ padding: '2rem', minHeight: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Savings Milestones</h3>
            <span className="badge badge-success">{goals.length} active targets</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '3px solid rgba(16,185,129,0.2)', borderTopColor: 'var(--secondary)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : goals.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {goals.map((item) => {
                const remaining = Math.max(0, item.target_amount - item.saved_amount);
                const isCompleted = item.progress_percent >= 100;

                return (
                  <div key={item.id} className="goal-card" style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '18px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all var(--transition-fast)'
                  }}>
                    
                    {isCompleted && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--secondary)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '8px',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <CheckCircle size={10} />
                        <span>Achieved</span>
                      </div>
                    )}

                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, paddingRight: isCompleted ? '5rem' : '0' }}>
                        {item.goal_name}
                      </h4>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '1rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Progress Ratio</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {item.progress_percent}%
                        </span>
                      </div>

                      <div className="progress-container" style={{ height: '6px', marginBottom: '1.25rem' }}>
                        <div className="progress-fill" style={{ 
                          width: `${item.progress_percent}%`,
                          background: isCompleted ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' : 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)'
                        }} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem', background: 'rgba(255, 255, 255, 0.01)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Saved Outflow</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {currency}{item.saved_amount.toLocaleString()}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Target Limit</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {currency}{item.target_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                      {!isCompleted ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={12} color="var(--primary)" />
                              <span>Time Horizon:</span>
                            </span>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.months_remaining} month(s) left</span>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <TrendingUp size={12} color="var(--secondary)" />
                              <span>Velocity Needed:</span>
                            </span>
                            <span style={{ fontWeight: 800, color: 'var(--secondary)' }}>{currency}{item.suggested_monthly_saving}/mo</span>
                          </div>
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
                          Goal target of {currency}{item.target_amount.toLocaleString()} fully secured on schedule!
                        </p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} />
                          Target: {new Date(item.deadline).toLocaleDateString()}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            onClick={() => startEdit(item)}
                            className="btn btn-outline"
                            style={{ padding: '0.4rem', borderRadius: '8px', color: 'var(--primary)', borderColor: 'rgba(99, 102, 241, 0.15)' }}
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn btn-outline"
                            style={{ padding: '0.4rem', borderRadius: '8px', color: 'var(--accent)', borderColor: 'rgba(244, 63, 94, 0.15)' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-secondary)', gap: '0.75rem' }}>
              <Target size={36} color="var(--text-muted)" />
              <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Establish your first savings goal in the left control panel.</p>
            </div>
          )}

        </div>

      </div>

      <style>{`
        .goal-card:hover {
          transform: translateY(-4px);
          border-color: var(--glass-border-hover) !important;
          box-shadow: var(--shadow-md);
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Savings;
