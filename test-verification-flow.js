const { Pool } = require('pg');

// Test the entire verification flow
async function testVerificationFlow() {
  const pool = new Pool({
    connectionString: 'postgresql://postgres:turing1123@gpai.cluster-cnbeqlnoaeg9.us-west-2.rds.amazonaws.com:5432/production',
    ssl: {
      rejectUnauthorized: false
    }
  });

  console.log('=== GPAI Database Verification Flow Test ===\n');

  try {
    // 1. Test connection
    console.log('1. Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connection successful\n');

    // 2. Check table structure
    console.log('2. Checking users table columns...');
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.log('Columns found:', columns.rows.length);
    
    // Check if there's a case-sensitive issue with column names
    const emailColumn = columns.rows.find(col => 
      col.column_name.toLowerCase() === 'email'
    );
    console.log('Email column details:', emailColumn);
    console.log();

    // 3. Get sample users to test with
    console.log('3. Getting sample registered (non-guest) users...');
    const sampleUsers = await pool.query(`
      SELECT id, email, "isGuest"
      FROM users 
      WHERE "isGuest" = false 
      AND email IS NOT NULL
      AND email NOT LIKE '%temp.gpai.internal%'
      LIMIT 5
    `);
    
    console.log('Sample registered users:');
    sampleUsers.rows.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id}, isGuest: ${user.isGuest})`);
    });
    console.log();

    // 4. Test the exact verification query
    if (sampleUsers.rows.length > 0) {
      const testEmail = sampleUsers.rows[0].email;
      console.log(`4. Testing verification query with: ${testEmail}`);
      
      // Test exact query from verifyGPAIUser
      const verifyQuery = `
        SELECT EXISTS(
          SELECT 1 FROM users 
          WHERE LOWER(email) = LOWER($1)
        ) as exists
      `;
      
      const result = await pool.query(verifyQuery, [testEmail]);
      console.log(`   Query result: ${result.rows[0].exists}`);
      
      // Also test without LOWER to see if case is an issue
      const exactQuery = `
        SELECT EXISTS(
          SELECT 1 FROM users 
          WHERE email = $1
        ) as exists
      `;
      
      const exactResult = await pool.query(exactQuery, [testEmail]);
      console.log(`   Exact match result: ${exactResult.rows[0].exists}`);
      console.log();
    }

    // 5. Test with different email variations
    console.log('5. Testing email case sensitivity...');
    const testEmails = [
      'ben@teamturing.com',
      'Ben@teamturing.com',
      'BEN@TEAMTURING.COM',
      'ben@TeamTuring.com'
    ];
    
    for (const email of testEmails) {
      const result = await pool.query(`
        SELECT EXISTS(
          SELECT 1 FROM users 
          WHERE LOWER(email) = LOWER($1)
        ) as exists
      `, [email]);
      console.log(`   ${email}: ${result.rows[0].exists}`);
    }
    console.log();

    // 6. Check if there are any special characters or encoding issues
    console.log('6. Checking for email format issues...');
    const emailFormats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN email LIKE '% %' THEN 1 END) as with_spaces,
        COUNT(CASE WHEN email != TRIM(email) THEN 1 END) as with_whitespace,
        COUNT(CASE WHEN email ~ '[A-Z]' THEN 1 END) as with_uppercase
      FROM users
      WHERE "isGuest" = false
    `);
    console.log('Email format statistics:');
    console.log(`   Total registered users: ${emailFormats.rows[0].total}`);
    console.log(`   With spaces: ${emailFormats.rows[0].with_spaces}`);
    console.log(`   With whitespace: ${emailFormats.rows[0].with_whitespace}`);
    console.log(`   With uppercase: ${emailFormats.rows[0].with_uppercase}`);
    console.log();

    // 7. Test with a specific email if provided
    const testSpecificEmail = process.argv[2];
    if (testSpecificEmail) {
      console.log(`7. Testing specific email: ${testSpecificEmail}`);
      
      // Check if exists at all
      const existsQuery = await pool.query(`
        SELECT id, email, "isGuest", "createdAt"
        FROM users 
        WHERE LOWER(email) = LOWER($1)
      `, [testSpecificEmail]);
      
      if (existsQuery.rows.length > 0) {
        console.log('✅ User found:');
        console.log(`   ID: ${existsQuery.rows[0].id}`);
        console.log(`   Email (stored): ${existsQuery.rows[0].email}`);
        console.log(`   isGuest: ${existsQuery.rows[0].isGuest}`);
        console.log(`   Created: ${existsQuery.rows[0].createdAt}`);
        
        // Test verification query
        const verifyResult = await pool.query(`
          SELECT EXISTS(
            SELECT 1 FROM users 
            WHERE LOWER(email) = LOWER($1)
          ) as exists
        `, [testSpecificEmail]);
        console.log(`   Verification result: ${verifyResult.rows[0].exists}`);
      } else {
        console.log('❌ User not found in database');
        
        // Try to find similar emails
        console.log('\n   Looking for similar emails...');
        const similarEmails = await pool.query(`
          SELECT email 
          FROM users 
          WHERE email ILIKE $1
          LIMIT 5
        `, [`%${testSpecificEmail.split('@')[0]}%`]);
        
        if (similarEmails.rows.length > 0) {
          console.log('   Similar emails found:');
          similarEmails.rows.forEach(row => {
            console.log(`     - ${row.email}`);
          });
        }
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

testVerificationFlow();