import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UpdateRequirements = () => {
  const [hospitalName, setHospitalName] = useState('');
  const [emergencyWardAvailable, setEmergencyWardAvailable] = useState(false);
  const [oxygenAvailable, setOxygenAvailable] = useState(false);
  const [icuAvailable, setIcuAvailable] = useState(false);
  const [emergencyWardMaintenance, setEmergencyWardMaintenance] = useState(false);
  const [oxygenMaintenance, setOxygenMaintenance] = useState(false);
  const [icuMaintenance, setIcuMaintenance] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [allStatuses, setAllStatuses] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calculate the status based on form inputs considering maintenance status
    let hospitalStatus = 'Inadequate'; // Default to Inadequate

    // Check if all services are available and not under maintenance
    const allAvailableAndNotUnderMaintenance = 
      (emergencyWardAvailable && !emergencyWardMaintenance) &&
      (oxygenAvailable && !oxygenMaintenance) &&
      (icuAvailable && !icuMaintenance);

    if (allAvailableAndNotUnderMaintenance) {
      hospitalStatus = 'Adequate'; // All services available and not under maintenance
    } else if (
      (emergencyWardAvailable && !emergencyWardMaintenance) ||
      (oxygenAvailable && !oxygenMaintenance) ||
      (icuAvailable && !icuMaintenance)
    ) {
      // If any service is available and not under maintenance, it's Partially Adequate
      hospitalStatus = 'Partially Adequate';
    }

    setStatus(hospitalStatus); // Update the status to show in the UI

    try {
      // Send the data to the backend
      const response = await axios.post('http://localhost:5001/update-requirements', {
        hospital_name: hospitalName,
        emergencyWardAvailable: emergencyWardAvailable ? 'Available' : 'Not Available',
        oxygenAvailable: oxygenAvailable ? 'Available' : 'Not Available',
        icuAvailable: icuAvailable ? 'Available' : 'Not Available',
        emergencyWardMaintenance: emergencyWardMaintenance ? 'Under Maintenance' : 'Not Under Maintenance',
        oxygenMaintenance: oxygenMaintenance ? 'Under Maintenance' : 'Not Under Maintenance',
        icuMaintenance: icuMaintenance ? 'Under Maintenance' : 'Not Under Maintenance',
        status:hospitalStatus,
      });

      console.log('Hospital status updated:', response.data);

      // Set all statuses from the response
      setAllStatuses(response.data.allStatuses);

      // Set success message
      setSuccessMessage('Hospital requirements updated successfully!');

      // Redirect to the dashboard after successful submission
      setTimeout(() => {
        navigate('/dashboard');
      }, 5000); // 5-second delay before redirecting
    } catch (err) {
      console.error('Error updating hospital status:', err);
      setError('Failed to update hospital status. Please try again.');
    }
  };

  // Handle checkbox changes for availability
  const handleAvailableChange = (type) => {
    if (type === 'emergencyWard') {
      setEmergencyWardAvailable(!emergencyWardAvailable);
      if (emergencyWardAvailable) setEmergencyWardMaintenance(false); // Disable maintenance if available is checked
    }
    if (type === 'oxygen') {
      setOxygenAvailable(!oxygenAvailable);
      if (oxygenAvailable) setOxygenMaintenance(false);
    }
    if (type === 'icu') {
      setIcuAvailable(!icuAvailable);
      if (icuAvailable) setIcuMaintenance(false);
    }
  };

  // Handle checkbox changes for maintenance
  const handleMaintenanceChange = (type) => {
    if (type === 'emergencyWard') {
      setEmergencyWardMaintenance(!emergencyWardMaintenance);
      if (emergencyWardMaintenance) setEmergencyWardAvailable(false); // Disable available if maintenance is checked
    }
    if (type === 'oxygen') {
      setOxygenMaintenance(!oxygenMaintenance);
      if (oxygenMaintenance) setOxygenAvailable(false);
    }
    if (type === 'icu') {
      setIcuMaintenance(!icuMaintenance);
      if (icuMaintenance) setIcuAvailable(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-6 text-gray-700">Update Hospital Requirements</h1>

        {/* Display Error */}
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

        {/* Display Success */}
        {successMessage && <div className="text-green-500 mb-4 text-center">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          {/* Hospital Name */}
          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="hospitalName">Hospital Name</label>
            <input
              type="text"
              id="hospitalName"
              name="hospitalName"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Emergency Ward Availability and Maintenance */}
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={emergencyWardAvailable}
                onChange={() => handleAvailableChange('emergencyWard')}
                className="mr-2"
              />
              <span className="text-gray-700">Emergency Ward Available</span>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={emergencyWardMaintenance}
                onChange={() => handleMaintenanceChange('emergencyWard')}
                className="mr-2"
                disabled={emergencyWardAvailable}
              />
              <span className="text-gray-700">Emergency Ward Maintenance</span>
            </div>
          </div>

          {/* Oxygen Availability and Maintenance */}
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={oxygenAvailable}
                onChange={() => handleAvailableChange('oxygen')}
                className="mr-2"
              />
              <span className="text-gray-700">Oxygen Available</span>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={oxygenMaintenance}
                onChange={() => handleMaintenanceChange('oxygen')}
                className="mr-2"
                disabled={oxygenAvailable}
              />
              <span className="text-gray-700">Oxygen Maintenance</span>
            </div>
          </div>

          {/* ICU Availability and Maintenance */}
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={icuAvailable}
                onChange={() => handleAvailableChange('icu')}
                className="mr-2"
              />
              <span className="text-gray-700">ICU Available</span>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={icuMaintenance}
                onChange={() => handleMaintenanceChange('icu')}
                className="mr-2"
                disabled={icuAvailable}
              />
              <span className="text-gray-700">ICU Maintenance</span>
            </div>
          </div>

          <div className="mb-4 text-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-3 rounded-md w-full hover:bg-blue-600 transition-colors"
            >
              Submit Requirements
            </button>
          </div>

          {/* Display Status */}
          {status && (
            <div className="text-center mt-4">
              <h2 className="font-semibold text-lg text-gray-700">Hospital Status: {status}</h2>
            </div>
          )}

          {/* Display All Statuses */}
          <div className="mt-4">
            <h2 className="font-semibold text-lg text-gray-700">Hospital Status:</h2>
            <ul>
              {allStatuses.map((status, index) => (
                <li key={index} className="mt-2">
                  <div>
                    <strong>Update :{index}</strong>
                    <strong>Status:</strong> {status.status}
                    {console.log(status.status)}
                  </div>
                  <div>
                    <strong>Emergency Ward:</strong> {status.emergency_ward_status}
                  </div>
                  <div>
                    <strong>Oxygen:</strong> {status.oxygen_status}
                  </div>
                  <div>
                    <strong>ICU:</strong> {status.icu_status}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateRequirements;
