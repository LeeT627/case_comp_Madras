const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gmjwhevctzlojxqrfhtc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtandoZXZjdHpsb2p4cXJmaHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjQzOTEsImV4cCI6MjA3MTY0MDM5MX0.XDDonlbbZ19G8viZIn0-lMArAbAfpI1zZzHWsep1W84';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking Supabase tables...\n');

  // Check if participant_info table exists
  const { data: participantInfo, error: participantError } = await supabase
    .from('participant_info')
    .select('*')
    .limit(1);

  if (participantError) {
    console.log('❌ participant_info table:', participantError.message);
    console.log('   → Table does not exist. Need to run SQL script.');
  } else {
    console.log('✅ participant_info table exists');
    
    // Get count
    const { count } = await supabase
      .from('participant_info')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   → Records: ${count || 0}`);
  }

  console.log('\nChecking storage buckets...\n');

  // Check storage buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.log('❌ Error checking buckets:', bucketsError.message);
  } else {
    console.log('Storage buckets:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
  }

  console.log('\n----------------------------');
  console.log('Summary:');
  console.log('- Supabase connection: ✅ Working');
  if (participantError) {
    console.log('- participant_info table: ❌ Needs to be created');
    console.log('\nNext steps:');
    console.log('1. Go to Supabase SQL Editor');
    console.log('2. Run the SQL from: supabase-participant-info.sql');
  } else {
    console.log('- participant_info table: ✅ Ready');
  }
}

checkTables().catch(console.error);