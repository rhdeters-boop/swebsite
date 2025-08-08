import axios from 'axios';

const baseURL = 'http://localhost:5000/api';

async function testProfileUpdate() {
  try {
    console.log('🧪 Testing Profile Update API...');
    console.log('=====================================');

    // First login
    console.log('📋 Logging in as rhdeters...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'rhdeters@gmail.com',
      password: 'password123' // This should be the password from registration
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('User:', loginResponse.data.user);

    // Set up axios defaults
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Test profile update
    console.log('\n📝 Testing profile update...');
    const updateData = {
      username: 'rhdeters',
      displayName: 'R.H. Deters',
      bio: 'Test bio update - /lastName removed!',
      profilePicture: '',
      bannerImage: ''
    };

    console.log('Update data:', updateData);

    const updateResponse = await axios.put(`${baseURL}/auth/profile`, updateData);
    
    console.log('✅ Profile update successful!');
    console.log('Updated user:', updateResponse.data.user);

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testProfileUpdate();
