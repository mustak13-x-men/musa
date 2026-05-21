import React, { useState, useEffect } from 'react';
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from '../api';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Calendar, 
  Tag, 
  X,
  Sparkles
} from 'lucide-react';

const CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Education"];

const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Travel: '#3b82f6',
  Shopping: '#ec4899',
  Bills: '#6366f1',
  Entertainment: '#8b5cf6',
  Health: '#10b981',
  Education: '#14b8a6'
};

const Expenses = () => {
  const [currency, setCurrency] = useState(localStorage.getItem('app_currency') || '₹');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Food');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formLoading, setFormLoading] = useState(false);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter && categoryFilter !== 'All') params.category = categoryFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const data = await fetchExpenses(params);
      setExpenses(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch expense records. Please verify server connection!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();

    const onCurrencyChange = () => {
      setCurrency(localStorage.getItem('app_currency') || '₹');
    };
    window.addEventListener('currencyChange', onCurrencyChange);
    return () => window.removeEventListener('currencyChange', onCurrencyChange);
  }, [searchTerm, categoryFilter, startDate, endDate]);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentEditId(null);
    setFormTitle('');
    setFormAmount('');
    setFormCategory('Food');
    setFormDescription('');
    setFormDate(new Date().toISOString().split('T')[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formTitle || !formAmount || !formCategory || !formDate) {
      setError('Please fill in all required fields!');
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        title: formTitle,
        amount: parseFloat(formAmount),
        category: formCategory,
        description: formDescription,
        date: formDate
      };

      if (isEditing) {
        await updateExpense(currentEditId, payload);
      } else {
        await createExpense(payload);
      }

      resetForm();
      loadExpenses();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit expense record!');
    } finally {
      setFormLoading(false);
    }
  };

  const startEdit = (item) => {
    setIsEditing(true);
    setCurrentEditId(item.id);
    setFormTitle(item.title);
    setFormAmount(item.amount);
    setFormCategory(item.category);
    setFormDescription(item.description);
    setFormDate(item.date);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await deleteExpense(id);
      loadExpenses();
    } catch (err) {
      console.error(err);
      setError('Failed to delete expense record!');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setStartDate('');
    setEndDate('');
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
        
        <div className="glass-panel" style={{
          padding: '2rem',
          position: 'sticky',
          top: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Sparkles size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {isEditing ? 'Modify Expense' : 'Log New Outflow'}
            </h3>
            {isEditing && (
              <button 
                onClick={resetForm}
                style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Expense Title*</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Grocery Shop"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Amount Spent ({currency})*</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="0.00"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category*</label>
              <select
                className="form-input"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                style={{ cursor: 'pointer' }}
                required
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Transaction Date*</label>
              <input
                type="date"
                className="form-input"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Optional Description</label>
              <textarea
                className="form-input"
                placeholder="Additional notes..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                style={{ flex: 1, padding: '0.85rem' }}
                disabled={formLoading}
              >
                {formLoading ? 'Saving...' : isEditing ? 'Confirm Changes' : 'Log Transaction'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={resetForm}
                  style={{ padding: '0.85rem' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--bg-tertiary)',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)'
              }}>
                <Tag size={15} color="var(--primary)" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    outline: 'none',
                    padding: '0.5rem'
                  }}
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ padding: '0.5rem', fontSize: '0.8rem', width: '130px' }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>to</span>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ padding: '0.5rem', fontSize: '0.8rem', width: '130px' }}
                />
              </div>

              {(searchTerm || categoryFilter !== 'All' || startDate || endDate) && (
                <button
                  className="btn btn-outline"
                  onClick={clearFilters}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '10px' }}
                >
                  Clear Filters
                </button>
              )}

            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Audit Ledger</h3>
              <span className="badge badge-primary">{expenses.length} Records</span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : expenses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {expenses.map((item) => (
                  <div key={item.id} className="expense-row" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--glass-border)',
                    transition: 'all var(--transition-fast)'
                  }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: `${CATEGORY_COLORS[item.category] || '#6b7280'}15`,
                        color: CATEGORY_COLORS[item.category] || '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.95rem'
                      }}>
                        {item.category.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{item.title}</h4>
                        {item.description && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{item.description}</p>
                        )}
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} />
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="badge" style={{
                            fontSize: '0.6rem',
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
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fb7185' }}>
                        -{currency}{item.amount.toFixed(2)}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => startEdit(item)}
                          className="btn btn-outline"
                          style={{ padding: '0.45rem', borderRadius: '10px', color: 'var(--primary)', borderColor: 'rgba(99, 102, 241, 0.15)' }}
                          title="Edit transaction"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn btn-outline"
                          style={{ padding: '0.45rem', borderRadius: '10px', color: 'var(--accent)', borderColor: 'rgba(244, 63, 94, 0.15)' }}
                          title="Delete transaction"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-secondary)', gap: '0.5rem' }}>
                <AlertCircle size={32} color="var(--text-muted)" />
                <p style={{ fontSize: '0.95rem' }}>No transaction records match your active search filters.</p>
                <button className="btn btn-outline" onClick={clearFilters} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', marginTop: '0.5rem' }}>Reset Filters</button>
              </div>
            )}

          </div>

        </div>

      </div>

      <style>{`
        .expense-row:hover {
          background: rgba(255,255,255,0.04) !important;
          border-color: var(--glass-border-hover) !important;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Expenses;
