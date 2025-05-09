import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignupPage1 = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [license, setLicense] = useState('');
  const [proof, setProof] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNext = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (!hospitalName || !license ) {
      setError('All fields are required!');
      return;
    }

    // Save the data in localStorage or pass via navigate state
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
    localStorage.setItem('hospitalName', hospitalName);
    localStorage.setItem('license', license);
    localStorage.setItem('proof', proof);

    navigate('/signup_2'); // Redirect to the map selection page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-4">Sign Up - General Details</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleNext}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded-md"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded-md"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Hospital Name"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Registered License"
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded-md"
          />
          
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md">
            Next
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage1;
