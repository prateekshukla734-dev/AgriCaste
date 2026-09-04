import React, { useState, useEffect } from 'react';

export default function TestRecommendations() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log('TestRecommendations component mounted');
    setIsLoaded(true);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Recommendations Page</h1>
      <p className="mb-4">
        This is a simple test page to verify routing and component loading.
      </p>
      <div className="bg-green-100 p-4 rounded">
        <p className="text-green-800">
          {isLoaded ? '✅ Component loaded successfully!' : '⏳ Loading...'}
        </p>
      </div>
      <div className="mt-4">
        <a 
          href="/recommendations" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Real Recommendations
        </a>
      </div>
    </div>
  );
}