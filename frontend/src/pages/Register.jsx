import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api';
import { Sparkles, User, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !email || !password) {
      setError('Please fill in all registration fields!');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters!');
      return;
    }

    setLoading(true);
    try {
      await registerUser({ username, email, password });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed. Username or email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '1.5rem',
      background: '#0b0f19',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background radial glowing effects */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '30vw',
        height: '30vw',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16,185,129,0) 70%)',
        filter: 'blur(80px)',
        zIndex: 1
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '20%',
        width: '30vw',
        height: '30vw',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99,102,241,0) 70%)',
        filter: 'blur(80px)',
        zIndex: 1
      }} />

      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '3rem 2.5rem',
        borderRadius: '24px',
        zIndex: 10,
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Brand header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            padding: '0.75rem',
            borderRadius: '16px',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Sparkles size={26} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Build your <span className="gradient-text">Spend Vault</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Enter your details below to initialize your digital financial vault
          </p>
        </div>

        {/* Dynamic Alerts */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            color: '#fb7185',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Inputs */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="yourname"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-secondary"
            disabled={loading}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', borderRadius: '12px', marginTop: '1rem' }}
          >
            {loading ? (
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Establish Vault Account</span>
                <ArrowRight size={16} />
              </div>
            )}
          </button>
        </form>

        {/* Redirect toggle */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          marginTop: '2rem'
        }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--secondary)', fontWeight: 700, textDecoration: 'none' }}>
            Sign In Here
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Register;
