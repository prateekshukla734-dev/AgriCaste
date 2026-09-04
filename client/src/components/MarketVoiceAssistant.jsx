import React, { useState, useRef, useEffect } from 'react';
import { voiceAPI } from '../services/api';
import { Mic, Volume2, ChevronDown, ChevronUp, Square, VolumeX } from 'lucide-react';

export default function MarketVoiceAssistant({ marketData, onVoiceQuery, states, crops }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [priceAnalysis, setPriceAnalysis] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
        
        if (event.results[current].isFinal) {
          analyzeMarketQuery(transcript);
        }
      };
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  // Analyze market-related voice queries
  const analyzeMarketQuery = async (query) => {
    setIsProcessing(true);
    
    try {
      // Extract crop and state from query using simple matching
      const mentionedCrop = crops.find(crop => 
        query.toLowerCase().includes(crop.toLowerCase())
      );
      
      const mentionedState = states.find(state => 
        query.toLowerCase().includes(state.toLowerCase()) || 
        query.toLowerCase().includes(state.split(' ')[0].toLowerCase())
      );

      // Call backend API for intelligent market analysis
      const apiResponse = await voiceAPI.processMarketQuery(query, mentionedCrop, mentionedState);
      
      let response = apiResponse.response || 'I processed your market query but could not generate a response.';

      // If we have market data in the response, use it
      if (apiResponse.marketData) {
        console.log('Market data:', apiResponse.marketData);
      }

      // Handle price comparisons if available
      if (apiResponse.priceComparisons) {
        console.log('Price comparisons:', apiResponse.priceComparisons);
      }

      setPriceAnalysis(response);
      speakResponse(response);
      onVoiceQuery?.(query, response);

    } catch (error) {
      console.error('Error analyzing market query:', error);
      const response = 'Sorry, I encountered an error analyzing market data. Please try again.';
      setPriceAnalysis(response);
      speakResponse(response);
    } finally {
      setIsProcessing(false);
    }
  };

  // Text-to-speech
  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
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
    return null;
  }

  return (
    <div className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ${isMinimized ? 'w-16 h-16' : 'w-80 h-auto'}`}>
      {isMinimized ? (
        // Minimized market assistant button
        <button
          onClick={() => setIsMinimized(false)}
          className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
            isListening ? 'bg-orange-500 animate-pulse' : 
            isSpeaking ? 'bg-blue-500 animate-pulse' :
            'bg-purple-600 hover:bg-purple-700'
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
        // Expanded market assistant widget
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Mic className="w-3 h-3" />
                <span className="font-medium">Market Assistant</span>
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
                <div className="flex items-center space-x-2 text-orange-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                  <span className="text-sm font-medium">Listening for price queries...</span>
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                  <span className="text-sm font-medium">Analyzing market data...</span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center space-x-2 text-purple-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                  <span className="text-sm font-medium">Speaking price info...</span>
                </div>
              )}
              {!isListening && !isProcessing && !isSpeaking && (
                <div className="text-gray-600 text-sm">Ask about crop prices!</div>
              )}
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">You asked:</div>
                <div className="text-gray-900">{transcript}</div>
              </div>
            )}

            {/* Price Analysis */}
            {priceAnalysis && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-600 mb-1">Price Analysis:</div>
                <div className="text-gray-900 text-sm">{priceAnalysis}</div>
              </div>
            )}

            {/* Controls */}
            <div className="flex space-x-2">
              {!isListening ? (
                <button
                  onClick={startListening}
                  disabled={isProcessing || isSpeaking}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Mic className="w-3 h-3" />
                  <span>Ask Price</span>
                </button>
              ) : (
                <button
                  onClick={stopListening}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Square className="w-3 h-3" />
                  <span>Stop</span>
                </button>
              )}

              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-colors"
                >
                  <VolumeX className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Examples */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Try asking:</div>
              <div className="space-y-1">
                <div className="text-xs text-gray-600">"What's the price of rice in Punjab?"</div>
                <div className="text-xs text-gray-600">"Which crop has the highest price?"</div>
                <div className="text-xs text-gray-600">"Compare wheat prices across states"</div>
                <div className="text-xs text-gray-600">"Show me the cheapest commodity"</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}