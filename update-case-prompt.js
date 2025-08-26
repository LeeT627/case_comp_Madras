const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://aggfpcxaxdyxiriqruos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZ2ZwY3hheGR5eGlyaXFydW9zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjEzOTM1NiwiZXhwIjoyMDcxNzE1MzU2fQ.hYGL6_pOASJXiI7ic6KZ1fJDGI-2PdE0SvR51Bl2uwM'; // Service role key

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCasePrompt(pdfPath) {
  try {
    // Read the PDF file
    const fileData = fs.readFileSync(pdfPath);
    
    console.log('Uploading new case prompt PDF...');
    
    // Upload/update the PDF (upsert will replace if exists)
    const { data, error } = await supabase.storage
      .from('public-files')
      .upload('case-competition-prompt.pdf', fileData, {
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
      .from('public-files')
      .getPublicUrl('case-competition-prompt.pdf');
    
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