import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { voiceAPI } from '../services/api';
import { Mic, Volume2, ChevronDown, Square, VolumeX } from 'lucide-react';

export default function VoiceAssistant({ farms, onVoiceAction }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState('');
  const [isMinimized, setIsMinimized] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognitionRef = useRef(null);
  const { user } = useAuth();

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
        
        if (event.results[current].isFinal) {
          processVoiceCommand(transcript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        setIsListening(false);
        console.error('Speech recognition error:', event.error);
      };
    }
  }, []);

  // Process voice commands
  const processVoiceCommand = async (command) => {
    setIsProcessing(true);
    
    try {
      // Call backend API for intelligent processing
      const apiResponse = await voiceAPI.processCommand(command, {
        farmsCount: farms?.length || 0,
        totalFarmArea: farms?.reduce((sum, farm) => sum + (farm.area || 0), 0) || 0,
        userRole: user?.role || 'farmer'
      });
      
      let response = apiResponse.response || 'I received your request but could not generate a response.';
      
      // Handle any actions suggested by the backend
      if (apiResponse.actions && apiResponse.actions.length > 0) {
        const action = apiResponse.actions[0];
        switch (action) {
          case 'view_recommendations':
            onVoiceAction?.('recommendations');
            break;
          case 'view_market':
            onVoiceAction?.('market');
            break;
          case 'add_farm':
            onVoiceAction?.('add-farm');
            break;
          case 'view_farms':
            onVoiceAction?.('farms');
            break;
          case 'check_weather':
            onVoiceAction?.('weather');
            break;
        }
      }

      setLastResponse(response);
      speakResponse(response);
    } catch (error) {
      console.error('Error processing voice command:', error);
      
      // Fallback to basic local processing if API fails
      const lowerCommand = command.toLowerCase();
      let response = '';
      
      if (lowerCommand.includes('farm') && (lowerCommand.includes('total') || lowerCommand.includes('how many'))) {
        response = `You have ${farms?.length || 0} farms with a total area of ${farms?.reduce((sum, farm) => sum + (farm.area || 0), 0).toFixed(1)} hectares.`;
      } else if (lowerCommand.includes('weather') || lowerCommand.includes('forecast')) {
        response = `I'll get the weather forecast for your farms. You can check the detailed weather information in the recommendations section.`;
        onVoiceAction?.('weather');
      } else if (lowerCommand.includes('recommendation') || lowerCommand.includes('suggest')) {
        response = `Let me get AI-powered crop recommendations for your farms.`;
        onVoiceAction?.('recommendations');
      } else if (lowerCommand.includes('market') || lowerCommand.includes('price')) {
        response = `I'll show you the latest market prices and trends.`;
        onVoiceAction?.('market');
      } else if (lowerCommand.includes('help')) {
        response = `I can help you with: farm statistics, weather forecasts, crop recommendations, market prices, and adding new farms. What would you like to know?`;
      } else {
        response = `I heard "${command}". I can help with farm information, weather, recommendations, market prices, or adding farms. What would you like to know?`;
      }

      setLastResponse(response);
      speakResponse(response);
      setLastResponse(response);
      speakResponse(response);
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  };

  // Text-to-speech
  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Check if browser supports speech recognition
  const isSpeechSupported = () => {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  };

  if (!isSpeechSupported()) {
    return null; // Don't render if not supported
  }

  return (
    <>
      {/* Voice Assistant Widget */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-16 h-16' : 'w-80 h-auto'}`}>
        {isMinimized ? (
          // Minimized floating button
          <button
            onClick={() => setIsMinimized(false)}
            className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
              isListening ? 'bg-red-500 animate-pulse' : 
              isSpeaking ? 'bg-blue-500 animate-pulse' :
              'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isListening ? (
              <Mic className="w-3 h-3 text-white" />
            ) : isSpeaking ? (
              <Volume2 className="w-3 h-3 text-white" />
            ) : (
              <Mic className="w-3 h-3 text-white" />
            )}
          </button>
        ) : (
          // Expanded widget
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Mic className="w-3 h-3" />
                  <span className="font-medium">Voice Assistant</span>
                </div>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Status */}
              <div className="mb-4">
                {isListening && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    <span className="text-sm font-medium">Listening...</span>
                  </div>
                )}
                {isProcessing && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                    <span className="text-sm font-medium">Processing...</span>
                  </div>
                )}
                {isSpeaking && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    <span className="text-sm font-medium">Speaking...</span>
                  </div>
                )}
                {!isListening && !isProcessing && !isSpeaking && (
                  <div className="text-gray-600 text-sm">Ready to help!</div>
                )}
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">You said:</div>
                  <div className="text-gray-900">{transcript}</div>
                </div>
              )}

              {/* Last Response */}
              {lastResponse && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 mb-1">Assistant:</div>
                  <div className="text-gray-900 text-sm">{lastResponse}</div>
                </div>
              )}

              {/* Controls */}
              <div className="flex space-x-2">
                {!isListening ? (
                  <button
                    onClick={startListening}
                    disabled={isProcessing || isSpeaking}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Mic className="w-3 h-3" />
                    <span>Speak</span>
                  </button>
                ) : (
                  <button
                    onClick={stopListening}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Square className="w-3 h-3" />
                    <span>Stop</span>
                  </button>
                )}

                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors"
                  >
                    <VolumeX className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Quick Commands */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Try saying:</div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-600">"How many farms do I have?"</div>
                  <div className="text-xs text-gray-600">"Show me recommendations"</div>
                  <div className="text-xs text-gray-600">"Check market prices"</div>
                  <div className="text-xs text-gray-600">"What's the weather forecast?"</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}