const axios = require('axios');

async function runTest() {
  const baseURL = 'https://nexusgate-tjdl.onrender.com/api';
  const gatewayURL = 'https://nexusgate-tjdl.onrender.com/gateway';
  
  try {
    // 1. Register a test user
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';
    console.log(`Registering ${email}...`);
    
    let res = await axios.post(`${baseURL}/auth/register`, {
      name: 'Agent Test',
      email,
      password
    });
    
    const token = res.data.accessToken;
    console.log('Registered! Token:', token);
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // 2. Create an API Endpoint
    console.log('Creating API Endpoint...');
    res = await axios.post(`${baseURL}/apis/create`, {
      name: 'JSONPlaceholder',
      targetUrl: 'https://jsonplaceholder.typicode.com',
      description: 'Test'
    }, { headers });
    
    const apiId = res.data._id;
    console.log('Created Endpoint ID:', apiId);
    
    // 3. Create an API Key
    console.log('Generating API Key...');
    res = await axios.post(`${baseURL}/apis/${apiId}/keys`, {
      label: 'My Test Key'
    }, { headers });
    
    const apiKey = res.data.key;
    console.log('Generated Key:', apiKey);
    
    // 4. Send a Gateway Request
    console.log('Sending Gateway Request...');
    res = await axios.get(`${gatewayURL}/todos/1`, {
      headers: { 'x-api-key': apiKey }
    });
    
    console.log('Gateway Response Status:', res.status);
    
    // 5. Check Dashboard Stats
    console.log('Fetching Dashboard Stats...');
    res = await axios.get(`${baseURL}/dashboard/stats`, { headers });
    console.log('Dashboard Stats:', res.data);
    
    // 6. Check Dashboard Logs
    res = await axios.get(`${baseURL}/dashboard/logs?limit=5`, { headers });
    console.log('Recent Logs Count:', res.data.logs.length);
    if(res.data.logs.length > 0) {
      console.log('First Log:', res.data.logs[0]);
    }
    
  } catch (err) {
    console.error('Test Failed:', err.response ? err.response.data : err.message);
  }
}

runTest();
