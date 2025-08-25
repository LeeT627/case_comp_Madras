// Test the API endpoint directly
async function testAPIEndpoint() {
  const testEmail = process.argv[2] || 'ben@teamturing.com';
  
  console.log(`Testing API endpoint with email: ${testEmail}\n`);
  
  try {
    // Test the local API endpoint
    const response = await fetch('http://localhost:3000/api/auth/verify-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response status text: ${response.statusText}`);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error calling API:', error.message);
    console.log('\nMake sure the Next.js dev server is running (npm run dev)');
  }
}

testAPIEndpoint();