import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';

const SignupPage2 = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [error, setError] = useState('');
  const [mapVisible, setMapVisible] = useState(false);
  const [proof, setProof] = useState(null); // To store the proof file
  const navigate = useNavigate();

  // Handle file input change
  const handleFileChange = (e) => {
    setProof(e.target.files[0]);
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = async () => {
    if (!latitude || !longitude) {
      setError('Please select a location on the map.');
      return;
    }

    // Get data from localStorage
    const email = localStorage.getItem('email');
    const password = localStorage.getItem('password');
    const hospitalName = localStorage.getItem('hospitalName');
    const license = localStorage.getItem('license');

    if (!email || !password || !hospitalName || !license) {
      setError('Missing required fields. Please complete the sign-up form.');
      return;
    }

    // Prepare the data for submission
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('hospitalName', hospitalName);
    formData.append('license', license);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);

    // Append the proof file to the FormData
    if (proof) {
      formData.append('proof', proof); // Ensure 'proof' matches the field name in the backend
    }

    try {
      // Send the data to the backend
      const response = await axios.post('http://localhost:5001/signup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(response);

      if (response.status === 201) {
        localStorage.clear(); // Clear the data after successful sign-up
        navigate('/'); // Redirect to the login page
      } else {
        console.error(response.data);
        setError('Error during sign-up. Please try again.');
      }
    } catch (err) {
      setError('Error during sign-up. Please try again.');
      console.error('Sign-up error:', err); // Log the error for debugging
    }
  };

  // Google Maps API key (replace with your own)
  const googleMapsApiKey = 'AIzaSyDD9QHcIZgqh6FXTA4CWQbFTB2ON3BSAxM'; // Ensure this is correct

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-4">Sign Up - Map Selection</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Button to Show Map */}
        {!mapVisible && (
          <button
            onClick={() => setMapVisible(true)}
            className="w-full bg-blue-500 text-white p-2 rounded-md mb-4"
          >
            Select Hospital Location
          </button>
        )}

        {/* Map Container */}
        {mapVisible && (
          <div className="relative mb-4" style={{ height: '400px', width: '100%' }}>
            <LoadScript googleMapsApiKey={googleMapsApiKey}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{ lat: 13.0827, lng: 80.2707 }} // Default location set to Chennai
                zoom={13}
                onClick={handleMapClick}
              >
                {latitude && longitude && (
                  <Marker position={{ lat: latitude, lng: longitude }} />
                )}
              </GoogleMap>
            </LoadScript>
          </div>
        )}

        {/* Proof File Upload */}
        <div className="mb-4">
          <label htmlFor="proof" className="block text-sm font-medium text-gray-700">
            Upload Proof (Hospital License)
          </label>
          <input
            type="file"
            id="proof"
            onChange={handleFileChange}
            className="w-full mt-2 border p-2"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded-md"
          disabled={!latitude || !longitude} // Disable button until location is selected
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default SignupPage2;
