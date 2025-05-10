const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testEndpoints() {
  try {
    // Test health check - no auth needed
    const healthResponse = await axios.get(`${API_URL}/progress/health`);
    console.log('Health check response:', healthResponse.data);

    // You can add more tests here with auth tokens if needed
  } catch (error) {
    console.error('Error testing endpoints:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testEndpoints(); 