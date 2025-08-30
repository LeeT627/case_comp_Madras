// Manual whitelist for bypassing email verification
// Add emails here that should automatically be marked as verified
// This is for testing and special cases only

export const WHITELISTED_EMAILS = [
  // Add emails here in lowercase
  'test@example.com',
  'admin@university.edu',
  'sukhun@test.edu',
  'sukhun0627@gmail.com',
  'sukhunlee0627@gmail.com',
  // Add more emails as needed
]

export function isEmailWhitelisted(email: string): boolean {
  return WHITELISTED_EMAILS.includes(email.toLowerCase().trim())
}