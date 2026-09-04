import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketAPI } from '../services/api';
import MarketVoiceAssistant from '../components/MarketVoiceAssistant';
import MarketChart from '../components/MarketChart';

export default function Market() {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  
  const { data: marketData, isLoading, refetch } = useQuery({
    queryKey: ['market', selectedState, selectedCrop],
    queryFn: () => marketAPI.getPrices(selectedState, selectedCrop),
    refetchInterval: 30000, // Refetch every 30 seconds for live data
  });

  // Trigger refetch when state or crop changes
  useEffect(() => {
    refetch();
  }, [selectedState, selectedCrop, refetch]);

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const crops = [
    'Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Soybean', 'Sunflower',
    'Groundnut', 'Tomato', 'Onion', 'Potato', 'Brinjal', 'Okra', 'Cauliflower',
    'Cabbage', 'Beans', 'Peas', 'Carrot', 'Mango', 'Banana', 'Orange', 'Apple'
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Market Prices</h1>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
          Track current market prices for various crops across different states.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <select
              id="state"
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="">All States</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="crop" className="block text-sm font-medium text-gray-700 mb-2">
              Crop
            </label>
            <select
              id="crop"
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              <option value="">All Crops</option>
              {crops.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Market Data Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Market Chart */}
        <MarketChart marketData={marketData} />
        
        {/* Price Trends */}
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600 text-sm sm:text-base">
                📈
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Avg. Price Today</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  ₹{marketData && marketData.length > 0 ? 
                    (marketData.reduce((sum, item) => sum + parseFloat(item.price), 0) / marketData.length).toFixed(0) : 
                    '0'}/kg
                </p>
                <p className="text-xs sm:text-sm text-green-600">Live market data</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600 text-sm sm:text-base">
                📊
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Markets</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {marketData ? marketData.length : 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Showing current data</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 rounded-full bg-yellow-100 text-yellow-600 text-sm sm:text-base">
                📉
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {new Date().toLocaleTimeString()}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Auto-refresh: 30s</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Data Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Current Market Prices</h2>
        </div>
        
        <div className="p-3 sm:p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading market data...</p>
            </div>
          ) : marketData && marketData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crop
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Market
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price (₹/kg)
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {marketData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900">
                        <div>
                          {item.crop}
                          <div className="sm:hidden text-xs text-gray-500 mt-1">
                            {item.market}
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.market}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{item.price}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.change >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.change >= 0 ? '+' : ''}{item.change}%
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📊</span>
              <p className="text-gray-600 mb-4">No market data available</p>
              <p className="text-sm text-gray-500">
                Try selecting a state or crop to view market prices.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Market Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Trending Up 📈</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Tomatoes</span>
                <span className="text-sm font-medium text-blue-900">+15.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Onions</span>
                <span className="text-sm font-medium text-blue-900">+8.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Potatoes</span>
                <span className="text-sm font-medium text-blue-900">+5.3%</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="font-medium text-red-900 mb-2">Trending Down 📉</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-red-700">Wheat</span>
                <span className="text-sm font-medium text-red-900">-3.1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-red-700">Rice</span>
                <span className="text-sm font-medium text-red-900">-1.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-red-700">Maize</span>
                <span className="text-sm font-medium text-red-900">-0.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Market Voice Assistant */}
      <MarketVoiceAssistant 
        marketData={marketData}
        states={states}
        crops={crops}
        onVoiceQuery={(query, response) => {
          console.log('Market voice query:', query, 'Response:', response);
        }}
      />
    </div>
  );
}