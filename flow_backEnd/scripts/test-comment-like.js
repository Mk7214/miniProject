// Run this script to test the comment like endpoint
const axios = require('axios');

// Replace these with actual values
const COMMENT_ID = '6819a7d60caa7cf4fd4842c9'; // From your error
const JWT_TOKEN = 'your_actual_jwt_token'; // Get this from your browser

// Test the endpoint
async function testLikeComment() {
  try {
    const response = await axios.post(`http://localhost:5000/api/comments/like/${COMMENT_ID}`, {}, {
      headers: {
        Authorization: `Bearer ${JWT_TOKEN}`
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testLikeComment(); 