import React, { useState, useRef, useEffect } from 'react';
import { voiceAPI } from '../services/api';
import { Mic, MicOff, Loader, Play, Volume2, User, Bot, Trash2, Square, VolumeX } from 'lucide-react';

export default function VoiceAnalysisPanel({ recommendations, onVoiceQuery }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  
  const recognitionRef = useRef(null);

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
          analyzeVoiceQuery(transcript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        setIsListening(false);
        console.error('Speech recognition error:', event.error);
        setAnalysisResult('Sorry, I couldn\'t understand that. Please try again.');
      };
    }
  }, []);

  // Analyze voice queries and provide intelligent responses
  const analyzeVoiceQuery = async (query) => {
    setIsProcessing(true);
    let response = '';

    try {
      // Add to conversation history
      const newEntry = { type: 'user', text: query, timestamp: new Date() };
      setConversationHistory(prev => [...prev, newEntry]);

      // Call backend API for intelligent analysis
      const farmData = recommendations && recommendations.farm_id ? {
        farm_id: recommendations.farm_id,
        soil: recommendations.soil_analysis,
        weather: recommendations.weather_forecast,
        crops: recommendations.recommended_crops
      } : null;

      const apiResponse = await voiceAPI.processFarmQuery(query, farmData?.farm_id);
      
      response = apiResponse.response || 'I processed your query but could not generate a detailed response.';

      // If we have specific farm data in the response, use it
      if (apiResponse.farmData) {
        setAnalysisResult(response);
      }

      // Handle any suggested actions
      if (apiResponse.actions && apiResponse.actions.length > 0) {
        // Actions can be handled by parent component through callback
        console.log('Suggested actions:', apiResponse.actions);
      }

      setAnalysisResult(response);
      
      // Add assistant response to history
      const assistantEntry = { type: 'assistant', text: response, timestamp: new Date() };
      setConversationHistory(prev => [...prev, assistantEntry]);
      
      speakResponse(response);
      
      // Trigger callback if provided
      onVoiceQuery?.(query, response);

    } catch (error) {
      console.error('Error analyzing voice query:', error);
      const response = 'Sorry, I encountered an error while processing your request. Please try again.';
      setAnalysisResult(response);
      
      // Add error response to history
      const assistantEntry = { type: 'assistant', text: response, timestamp: new Date() };
      setConversationHistory(prev => [...prev, assistantEntry]);
      
      speakResponse(response);
    } finally {
      setIsProcessing(false);
      setTranscript('');
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

  const clearHistory = () => {
    setConversationHistory([]);
    setAnalysisResult('');
  };

  // Check if browser supports speech recognition
  const isSpeechSupported = () => {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  };

  if (!isSpeechSupported()) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <MicOff className="w-3 h-3 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Voice features are not supported in this browser</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Mic className="w-3 h-3 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Voice Analysis</h3>
            <p className="text-sm text-gray-600">Ask questions about your farm recommendations</p>
          </div>
        </div>
        {conversationHistory.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Status Indicators */}
      <div className="mb-4">
        {isListening && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 rounded-lg p-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
            <span className="font-medium">Listening... Speak now</span>
          </div>
        )}
        
        {isProcessing && (
          <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 rounded-lg p-3">
            <Loader className="w-3 h-3 animate-spin" />
            <span className="font-medium">Analyzing your question...</span>
          </div>
        )}

        {isSpeaking && (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 rounded-lg p-3">
            <Volume2 className="w-3 h-3" />
            <span className="font-medium">Speaking response...</span>
          </div>
        )}
      </div>

      {/* Live Transcript */}
      {transcript && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <div className="text-sm font-medium text-gray-700 mb-1">You're saying:</div>
          <div className="text-gray-900">{transcript}</div>
        </div>
      )}

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div className="mb-4 max-h-60 overflow-y-auto space-y-3">
          {conversationHistory.map((entry, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                entry.type === 'user' 
                  ? 'bg-blue-50 border-l-4 border-blue-500 ml-8' 
                  : 'bg-green-50 border-l-4 border-green-500 mr-8'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${
                  entry.type === 'user' ? 'text-blue-700' : 'text-green-700'
                }`}>
                  {entry.type === 'user' ? 'You' : 'Assistant'}
                </span>
                <span className="text-xs text-gray-500">
                  {entry.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm text-gray-900">{entry.text}</div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex space-x-3">
        {!isListening ? (
          <button
            onClick={startListening}
            disabled={isProcessing || isSpeaking}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Mic className="w-3 h-3" />
            <span>Ask Question</span>
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Square className="w-3 h-3" />
            <span>Stop Listening</span>
          </button>
        )}

        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <VolumeX className="w-3 h-3" />
            <span>Mute</span>
          </button>
        )}
      </div>

      {/* Quick Suggestions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm font-medium text-gray-700 mb-2">Try asking:</div>
        <div className="flex flex-wrap gap-2">
          {[
            "What crops do you recommend?",
            "How's the weather forecast?",
            "What about soil conditions?",
            "Which crop is most profitable?",
            "When should I plant?",
            "How much water do I need?"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => analyzeVoiceQuery(suggestion)}
              disabled={isListening || isProcessing || isSpeaking}
              className="text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 px-3 py-1 rounded-full transition-colors"
            >
              "{suggestion}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}