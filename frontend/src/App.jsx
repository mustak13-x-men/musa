import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Savings from './pages/Savings';
import AIInsights from './pages/AIInsights';

const DashboardLayout = ({ children }) => {
  return (
    <div className="app-container">
      
      <Sidebar />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        <div className="main-content">
          
          <Navbar />
          
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
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
