// Test Resend email sending directly
const { Resend } = require('resend');

async function testResend() {
  // Replace with your actual Resend API key
  const RESEND_API_KEY = 'your_resend_api_key_here';
  
  const resend = new Resend(RESEND_API_KEY);
  
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'test@example.com', // Replace with your email
      subject: 'Test Email',
      html: '<p>This is a test email from GPAI Case Competition</p>'
    });
    
    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// To run: node test-resend.js
console.log('Add your Resend API key to this file first!');
console.log('Get it from: https://resend.com/api-keys');