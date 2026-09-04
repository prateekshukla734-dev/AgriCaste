// Test registration API locally
import axios from 'axios';

const API_BASE = 'https://sih-crop-recommendation.onrender.com/api/v1';

const testRegistration = async () => {
  try {
    console.log('Testing registration API...');
    
    const userData = {
      name: 'Test User',
      phone: '1234567890',
      email: 'test@example.com',
      password: 'password123',
      language: 'en'
    };
    
    console.log('Sending registration data:', JSON.stringify(userData, null, 2));
    
    const response = await axios.post(`${API_BASE}/user/register`, userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Registration successful:', response.data);
    
  } catch (error) {
    console.error('❌ Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testRegistration();