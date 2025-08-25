const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:turing1123@gpai.cluster-cnbeqlnoaeg9.us-west-2.rds.amazonaws.com:5432/production',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testUser(email) {
  try {
    console.log(`\nTesting email: ${email}\n`);
    
    // Check if user exists
    const query = `
      SELECT id, email, "isGuest", "createdAt"
      FROM users 
      WHERE LOWER(email) = LOWER($1)
    `;
    
    const result = await pool.query(query, [email]);
    
    if (result.rows.length > 0) {
      console.log('✅ User found in GPAI database:');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Email: ${result.rows[0].email}`);
      console.log(`   Is Guest: ${result.rows[0].isGuest}`);
      console.log(`   Created: ${result.rows[0].createdAt}`);
    } else {
      console.log('❌ User NOT found in GPAI database');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

// Test with the email you're trying
const testEmail = process.argv[2] || 'test@example.com';
testUser(testEmail);