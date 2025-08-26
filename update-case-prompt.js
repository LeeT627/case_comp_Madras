const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://aggfpcxaxdyxiriqruos.supabase.co';
const supabaseKey = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Replace with your service role key

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCasePrompt(pdfPath) {
  try {
    // Read the PDF file
    const fileData = fs.readFileSync(pdfPath);
    
    console.log('Uploading new case prompt PDF...');
    
    // Upload/update the PDF (upsert will replace if exists)
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload('public/case-competition-prompt.pdf', fileData, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true // This will overwrite the existing file
      });
    
    if (error) {
      console.error('Upload error:', error);
      return;
    }
    
    console.log('✅ PDF updated successfully!');
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl('public/case-competition-prompt.pdf');
    
    console.log('Public URL:', publicUrl);
    console.log('This URL is already linked in your dashboard.');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

// Usage: node update-case-prompt.js "/path/to/your/new.pdf"
const pdfPath = process.argv[2];
if (!pdfPath) {
  console.log('Please provide the path to the PDF file');
  console.log('Usage: node update-case-prompt.js "/path/to/your/file.pdf"');
} else {
  updateCasePrompt(pdfPath);
}