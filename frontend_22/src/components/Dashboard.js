import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [emergency, setEmergency] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  // Fetch Notifications
  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5001/patient-data', {
        headers: { Authorization: token },
      });

      if (response.data && response.data.length > 0) {
        setNotifications(response.data);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications. Please try again.');
    }
  };

  // Fetch User's Geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      (err) => {
        console.error('Error getting location:', err);
        setError('Failed to retrieve your location.');
      }
    );

    fetchNotifications();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <button
    onClick={handleLogout}
    className="bg-red-500 text-white px-4 py-2 rounded-md absolute top-4 right-4"
    >
      Logout
    </button>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
  

        <h1 className="text-2xl font-semibold text-center mb-6 text-gray-700">
          Notifications
        </h1>

        {/* Display Error */}
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

        {/* Display Geolocation */}
        {userLocation ? (
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">Your Location:</p>
            <p className="text-gray-800 font-semibold">
              Latitude: {userLocation.lat}, Longitude: {userLocation.lon}
            </p>
          </div>
        ) : (
          <p className="text-center text-gray-600 mb-4">Fetching your location...</p>
        )}

        {/* Display Notifications */}
        <div className="mt-6">
          {notifications.length === 0 ? (
            <div className="text-gray-600 text-center">No new patient data available.</div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Notifications</h2>
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className="bg-gray-100 p-4 rounded-md shadow-sm mb-4"
                >
                  <h3 className="font-bold">{notification.patient_name}</h3>
                  <p>Age Group: {notification.age_group}</p>
                  <p>Emergency Type: {notification.emergency_type}</p>
                  <p>Gender: {notification.gender}</p>
                </div>
              ))}
            </div>
          )}

          {/* Refresh Notifications */}
          <button
            onClick={fetchNotifications}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
          >
            Refresh Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
