import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Page components
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Savings from './pages/Savings';
import AIInsights from './pages/AIInsights';

// Layout wrapper for all protected dashboard screens
const DashboardLayout = ({ children }) => {
  return (
    <div className="app-container">
      {/* Dynamic Navigation Sidebar */}
      <Sidebar />
      
      {/* Content wrapper */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        <div className="main-content">
          {/* Top Navbar */}
          <Navbar />
          
          {/* Page contents */}
          <main>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure Protected Dashboard routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/expenses" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Expenses />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/savings" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Savings />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/ai-insights" element={
            <ProtectedRoute>
              <DashboardLayout>
                <AIInsights />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Root fallback redirecting */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
