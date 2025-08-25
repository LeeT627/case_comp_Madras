const { Pool } = require('pg');

async function testGPAIConnection() {
  console.log('Testing GPAI Database Connection...\n');
  
  // Test with the actual connection string
  const pool = new Pool({
    connectionString: 'postgresql://postgres:turing1123@gpai.cluster-cnbeqlnoaeg9.us-west-2.rds.amazonaws.com:5432/production',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // 1. Test basic connection
    console.log('1. Testing connection...');
    const testConn = await pool.query('SELECT NOW()');
    console.log('✅ Connection successful\n');

    // 2. Check table structure
    console.log('2. Checking users table structure...');
    const tableInfo = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      LIMIT 10
    `);
    console.log('Users table columns:');
    tableInfo.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    // 3. Test the exact query we use
    console.log('\n3. Testing our verification query...');
    const testEmail = 'test@example.com';
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM users 
        WHERE LOWER(email) = LOWER($1)
      ) as exists
    `;
    const result = await pool.query(query, [testEmail]);
    console.log(`Query result for ${testEmail}: ${result.rows[0].exists}`);

    // 4. Get a sample of real emails (to see format)
    console.log('\n4. Sample of actual emails in database:');
    const sampleEmails = await pool.query(`
      SELECT email 
      FROM users 
      WHERE email NOT LIKE '%temp.gpai.internal%' 
      AND email IS NOT NULL
      LIMIT 5
    `);
    sampleEmails.rows.forEach(row => {
      console.log(`   - ${row.email}`);
    });

    // 5. Count total non-guest users
    console.log('\n5. User statistics:');
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN "isGuest" = false THEN 1 END) as registered,
        COUNT(CASE WHEN "isGuest" = true THEN 1 END) as guests
      FROM users
    `);
    console.log(`   Total users: ${stats.rows[0].total}`);
    console.log(`   Registered: ${stats.rows[0].registered}`);
    console.log(`   Guests: ${stats.rows[0].guests}`);

    // 6. Test with a specific email if provided
    const testSpecificEmail = process.argv[2];
    if (testSpecificEmail) {
      console.log(`\n6. Testing specific email: ${testSpecificEmail}`);
      const specificResult = await pool.query(query, [testSpecificEmail]);
      console.log(`   Exists in database: ${specificResult.rows[0].exists}`);
      
      if (specificResult.rows[0].exists) {
        const userDetails = await pool.query(`
          SELECT id, email, "isGuest", "createdAt"
          FROM users
          WHERE LOWER(email) = LOWER($1)
        `, [testSpecificEmail]);
        console.log('   User details:');
        console.log(`     - ID: ${userDetails.rows[0].id}`);
        console.log(`     - Email: ${userDetails.rows[0].email}`);
        console.log(`     - Is Guest: ${userDetails.rows[0].isGuest}`);
        console.log(`     - Created: ${userDetails.rows[0].createdAt}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
    console.log('\n✅ Test complete');
  }
}

testGPAIConnection();