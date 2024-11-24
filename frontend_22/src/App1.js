import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignupPage';
import SignupPage2 from './components/SignupPage2';
import Dashboard from './components/Dashboard';
import './index.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup_2" element={<SignupPage2/>} />
      </Routes>
    </Router>
  );
};

export default App;
