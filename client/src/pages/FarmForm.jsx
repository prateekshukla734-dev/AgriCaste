import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { farmAPI } from '../services/api';

export default function FarmForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area: '',
    soilType: '',
    irrigationType: '',
    coordinates: {
      latitude: '',
      longitude: ''
    }
  });
  
  const [error, setError] = useState('');

  const createFarmMutation = useMutation({
    mutationFn: farmAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['farms']);
      navigate('/dashboard');
    },
    onError: (err) => {
      console.error('Farm creation error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create farm');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!formData.name.trim()) {
      setError('Farm name is required');
      return;
    }
    if (!formData.coordinates.latitude || !formData.coordinates.longitude) {
      setError('Latitude and longitude are required');
      return;
    }
    
    // Parse coordinates to ensure they're valid numbers
    const lat = parseFloat(formData.coordinates.latitude);
    const lng = parseFloat(formData.coordinates.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid numeric coordinates');
      return;
    }
    
    const farmData = {
      name: formData.name.trim(),
      geom: {
        type: 'Polygon',
        coordinates: [[
          [lng, lat],
          [lng + 0.001, lat],
          [lng + 0.001, lat + 0.001],
          [lng, lat + 0.001],
          [lng, lat]
        ]]
      }
    };
    
    // Add optional fields only if they have values
    if (formData.area) {
      farmData.area = parseFloat(formData.area);
    }
    if (formData.irrigationType) {
      farmData.irrigationType = formData.irrigationType;
    }
    if (formData.soilType || formData.location) {
      farmData.metadata = {};
      if (formData.location) farmData.metadata.location = formData.location;
      if (formData.soilType) farmData.metadata.soilType = formData.soilType;
    }
    
    console.log('Sending farm data:', JSON.stringify(farmData, null, 2));
    createFarmMutation.mutate(farmData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Farm</h1>
          <p className="text-gray-600 mt-1">Register your farm to get personalized recommendations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Farm Name
              </label>
              <input
                type="text"
                id="name"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                Area (in acres)
              </label>
              <input
                type="number"
                id="area"
                step="0.1"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="soilType" className="block text-sm font-medium text-gray-700">
                Soil Type
              </label>
              <select
                id="soilType"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
              >
                <option value="">Select soil type</option>
                <option value="loamy">Loamy</option>
                <option value="clay">Clay</option>
                <option value="sandy">Sandy</option>
                <option value="silty">Silty</option>
                <option value="peaty">Peaty</option>
                <option value="chalky">Chalky</option>
              </select>
            </div>

            <div>
              <label htmlFor="irrigationType" className="block text-sm font-medium text-gray-700">
                Irrigation Type
              </label>
              <select
                id="irrigationType"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={formData.irrigationType}
                onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
              >
                <option value="">Select irrigation type</option>
                <option value="drip">Drip Irrigation</option>
                <option value="sprinkler">Sprinkler</option>
                <option value="flood">Flood Irrigation</option>
                <option value="furrow">Furrow Irrigation</option>
                <option value="rainfed">Rain-fed</option>
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Location Coordinates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                  Latitude
                </label>
                <input
                  type="number"
                  id="latitude"
                  step="any"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={formData.coordinates.latitude}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    coordinates: { ...formData.coordinates, latitude: e.target.value }
                  })}
                />
              </div>
              
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                  Longitude
                </label>
                <input
                  type="number"
                  id="longitude"
                  step="any"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={formData.coordinates.longitude}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    coordinates: { ...formData.coordinates, longitude: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createFarmMutation.isPending}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50"
            >
              {createFarmMutation.isPending ? 'Creating...' : 'Create Farm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}