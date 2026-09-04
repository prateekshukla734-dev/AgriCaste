import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { farmAPI, mlAPI } from '../services/api';
import VoiceAnalysisPanel from '../components/VoiceAnalysisPanel';

export default function Recommendations() {
  const [selectedFarm, setSelectedFarm] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Check for speech synthesis support
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSupported(true);
    }
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Recommendations component mounted');
    return () => {
      console.log('Recommendations component unmounted');
      // Stop any ongoing speech when component unmounts
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const { data: farms, isLoading: farmsLoading, error: farmsError } = useQuery({
    queryKey: ['farms'],
    queryFn: () => {
      console.log('Fetching farms...');
      return farmAPI.list();
    },
    onSuccess: (data) => {
      console.log('Farms fetched successfully:', data);
    },
    onError: (error) => {
      console.error('Error fetching farms:', error);
    }
  });

  useEffect(() => {
    console.log('Farms data update:', { farms, farmsLoading, farmsError });
  }, [farms, farmsLoading, farmsError]);

  // Text-to-Speech functions
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8; // Slightly slower for better clarity
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakRecommendations = () => {
    if (!recommendations || !recommendations.crops) return;
    
    const farmName = farms?.find(f => f._id === selectedFarm)?.name || 'your farm';
    let speechText = `Here are the crop recommendations for ${farmName}. `;
    
    recommendations.crops.forEach((crop, index) => {
      speechText += `Option ${index + 1}: ${crop.name}. `;
      speechText += `Confidence level: ${Math.round(crop.confidence * 100)} percent. `;
      speechText += `Expected yield: ${crop.expectedYield}. `;
      speechText += `Growing season: ${crop.season}. `;
      speechText += `Market price: ${crop.marketPrice} rupees per kilogram. `;
      speechText += `${crop.description}. `;
      
      if (crop.tips && crop.tips.length > 0) {
        speechText += `Key tips: `;
        crop.tips.slice(0, 2).forEach(tip => {
          speechText += `${tip}. `;
        });
      }
      speechText += `Next recommendation. `;
    });
    
    if (recommendations.weatherForecast) {
      speechText += `Weather insights: ${recommendations.weatherForecast}. `;
    }
    
    if (recommendations.soilRecommendations) {
      speechText += `Soil recommendations: ${recommendations.soilRecommendations}. `;
    }
    
    speechText += `That concludes your crop recommendations. Thank you.`;
    
    speakText(speechText);
  };

  // Auto-speak recommendations when they change
  useEffect(() => {
    if (recommendations && recommendations.crops && speechSupported) {
      // Small delay to ensure UI renders first
      const timer = setTimeout(() => {
        speakRecommendations();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [recommendations, speechSupported, selectedFarm, farms]);

  const handleGetRecommendations = async () => {
    if (!selectedFarm) {
      setError('Please select a farm');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Getting recommendations for farm:', selectedFarm);
      const result = await mlAPI.getRecommendations(selectedFarm);
      console.log('Recommendations result:', result);
      setRecommendations(result);
      
      // Automatically speak the recommendations when they're received
      setTimeout(() => {
        if (speechSupported) {
          speakRecommendations();
        }
      }, 500); // Small delay to ensure UI updates first
      
    } catch (err) {
      console.error('Recommendations error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Always render something to debug
  console.log('Rendering recommendations page...');

  // Handle loading and error states
  if (farmsLoading) {
    console.log('Showing loading state');
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Crop Recommendations</h1>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (farmsError) {
    console.log('Showing error state:', farmsError);
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Crop Recommendations</h1>
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              Error loading farms: {farmsError.message}
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering main recommendations UI, farms:', farms);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Crop Recommendations</h1>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
          Get AI-powered crop recommendations based on your farm's soil, climate, and market conditions.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
          <div className="flex-1">
            <label htmlFor="farm" className="block text-sm font-medium text-gray-700 mb-2">
              Select Farm
            </label>
            <select
              id="farm"
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={selectedFarm}
              onChange={(e) => setSelectedFarm(e.target.value)}
            >
              <option value="">Choose a farm</option>
              {farms?.map((farm) => (
                <option key={farm._id} value={farm._id}>
                  {farm.name} - {farm.location}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleGetRecommendations}
            disabled={loading || !selectedFarm}
            className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {loading ? 'Analyzing...' : 'Get Recommendations'}
          </button>

          {/* Voice Control Buttons */}
          {speechSupported && recommendations && (
            <div className="flex gap-2 justify-center sm:justify-start">
              <button
                onClick={speakRecommendations}
                disabled={isSpeaking}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 sm:gap-2 text-sm"
                title="Listen to recommendations"
              >
                <span className="text-base sm:text-lg">🔊</span>
                <span className="hidden sm:inline">{isSpeaking ? 'Speaking...' : 'Listen'}</span>
              </button>
              
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1 sm:gap-2 text-sm"
                  title="Stop speaking"
                >
                  <span className="text-base sm:text-lg">🔇</span>
                  <span className="hidden sm:inline">Stop</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Speech Status Indicator */}
        {speechSupported && isSpeaking && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2">
              <div className="animate-pulse w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-blue-700 text-sm font-medium">
                🎙️ Reading recommendations aloud...
              </span>
            </div>
          </div>
        )}

        {!speechSupported && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <span className="text-yellow-700 text-sm">
              ⚠️ Voice features are not supported in your browser. Please use a modern browser for audio recommendations.
            </span>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
      </div>

      {recommendations && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Recommendations for {farms?.find(f => f._id === selectedFarm)?.name}
            </h2>
            
            {speechSupported && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-lg">🎧</span>
                <span>Voice-enabled recommendations</span>
                {isSpeaking && (
                  <div className="flex items-center gap-1">
                    <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-600 font-medium">Speaking</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {recommendations.crops && recommendations.crops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.crops.map((crop, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{crop.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      crop.confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                      crop.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {Math.round(crop.confidence * 100)}% match
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{crop.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expected Yield:</span>
                      <span className="font-medium">{crop.expectedYield}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Growing Season:</span>
                      <span className="font-medium">{crop.season}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Market Price:</span>
                      <span className="font-medium text-green-600">₹{crop.marketPrice}/kg</span>
                    </div>
                  </div>
                  
                  {crop.tips && crop.tips.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Growing Tips:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {crop.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start">
                            <span className="text-green-500 mr-1">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">🌱</span>
              <p className="text-gray-600 mb-4">No recommendations available</p>
              <p className="text-sm text-gray-500">
                Try adjusting your farm details or check back later for updated recommendations.
              </p>
            </div>
          )}
          
          {recommendations.weatherForecast && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Weather Insights</h3>
              <p className="text-sm text-gray-700">{recommendations.weatherForecast}</p>
            </div>
          )}
          
          {recommendations.soilRecommendations && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Soil Recommendations</h3>
              <p className="text-sm text-gray-700">{recommendations.soilRecommendations}</p>
            </div>
          )}
        </div>
      )}

      {!recommendations && farms?.length === 0 && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <span className="text-4xl mb-4 block">🏡</span>
          <p className="text-gray-600 mb-4">No farms found</p>
          <p className="text-sm text-gray-500 mb-4">
            You need to add a farm before getting recommendations.
          </p>
          <a
            href="/farms/new"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Add Your First Farm
          </a>
        </div>
      )}
      
      {/* Voice Analysis Panel */}
      <VoiceAnalysisPanel 
        recommendations={recommendations}
        onVoiceQuery={(query, response) => {
          console.log('Voice query:', query, 'Response:', response);
        }}
      />
    </div>
  );
}