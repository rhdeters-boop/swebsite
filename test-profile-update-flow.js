import axios from 'axios';

// Simple test to verify profile update flow
async function testProfileUpdateFlow() {
  try {
    console.log('Testing profile update flow...');

    // Mock test data
    const testProfile = {
      username: 'testuser',
      displayName: 'Test User Updated',
      bio: 'Updated bio text',
      profilePicture: 'https://void-media.s3.amazonaws.com/profile/1/profile/test-image.jpg',
      bannerImage: 'https://void-media.s3.amazonaws.com/profile/1/banner/test-banner.jpg'
    };

    // Test the API endpoint
    const response = await axios.put('http://localhost:5000/auth/profile', testProfile, {
      headers: {
        'Authorization': 'Bearer YOUR_TEST_TOKEN_HERE',
        'Content-Type': 'application/json'
      }
    });

    console.log('Profile update response:', response.data);
    console.log('Updated user data:', JSON.stringify(response.data.user, null, 2));

  } catch (error) {
    console.error('Profile update test failed:', error.response?.data || error.message);
  }
}

// Run the test
testProfileUpdateFlow();
