// Test whitelist function
const WHITELISTED_EMAILS = [
  'test@example.com',
  'admin@university.edu',
  'sukhun@test.edu',
  'sukhun0627@gmail.com',
  'sukhunlee0627@gmail.com',
]

function isEmailWhitelisted(email) {
  return WHITELISTED_EMAILS.includes(email.toLowerCase().trim())
}

// Test cases
const testEmails = [
  'sukhun0627@gmail.com',
  'SUKHUN0627@GMAIL.COM',
  'sukhunlee0627@gmail.com',
  'random@gmail.com'
]

console.log('Testing whitelist function:')
testEmails.forEach(email => {
  console.log(`${email}: ${isEmailWhitelisted(email) ? '✅ WHITELISTED' : '❌ NOT whitelisted'}`)
})