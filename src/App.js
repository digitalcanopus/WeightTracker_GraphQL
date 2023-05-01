import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import AddRecordPage from './components/AddRecordPage';
import AuthPage from './components/AuthPage';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import { Navigate } from 'react-router-dom';

function App() {
  const [records, setRecords] = useState([]);
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="container">
    <Routes>        
        <Route path="/" element={<HomePage records={records} />} />
        <Route path="/add" element={<AddRecordPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<LoginForm handleSwitchToRegister={() => setIsLogin(false)} />} />
        <Route path="/register" element={<RegistrationForm handleSwitchToLogin={() => setIsLogin(true)} />} />
        <Route path="*" element={<Navigate to='/auth' />} />
    </Routes>
    </div>
  );
}

export default App;