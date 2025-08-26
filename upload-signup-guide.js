const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://aggfpcxaxdyxiriqruos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZ2ZwY3hheGR5eGlyaXFydW9zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjEzOTM1NiwiZXhwIjoyMDcxNzE1MzU2fQ.hYGL6_pOASJXiI7ic6KZ1fJDGI-2PdE0SvR51Bl2uwM'; // Service role key

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadSignupGuide(imagePath) {
  try {
    // Read the image file
    const fileData = fs.readFileSync(imagePath);
    
    console.log('Uploading signup guide image...');
    
    // Upload the image to public-files bucket
    const { data, error } = await supabase.storage
      .from('public-files')
      .upload('gpai-signup-guide.png', fileData, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true // This will overwrite if exists
      });
    
    if (error) {
      console.error('Upload error:', error);
      return;
    }
    
    console.log('✅ Image uploaded successfully!');
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('public-files')
      .getPublicUrl('gpai-signup-guide.png');
    
    console.log('Public URL:', publicUrl);
    console.log('\nYou can now use this URL in the How to Apply page.');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

// Usage: node upload-signup-guide.js "/path/to/your/image.png"
const imagePath = process.argv[2];
if (!imagePath) {
  console.log('Please provide the path to the image file');
  console.log('Usage: node upload-signup-guide.js "/path/to/your/image.png"');
} else {
  uploadSignupGuide(imagePath);
}