const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:turing1123@gpai.cluster-cnbeqlnoaeg9.us-west-2.rds.amazonaws.com:5432/production',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('Testing GPAI database connection...\n');
    
    // Test connection
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('✅ Connected to GPAI database!');
    console.log(`   Total users: ${result.rows[0].count}`);
    
    // Test a sample query
    const sampleUsers = await pool.query('SELECT email FROM users LIMIT 3');
    console.log('\nSample users:');
    sampleUsers.rows.forEach(user => {
      console.log(`   - ${user.email}`);
    });
    
    console.log('\n✅ GPAI database connection successful!');
    console.log('You can now add this to Vercel environment variables.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();