// Manual whitelist for bypassing email verification
// Add emails here that should automatically be marked as verified
// This is for testing and special cases only

export const WHITELISTED_EMAILS = [
  // Add emails here in lowercase
  'shashwatgwork1@gmail.com',
  'gargpratham71@gmail.com',
  'shishodiavishaka@gmail.com',
  'ss9839538505@gmail.com',
  'shashwatcls10@gmail.com',
  'sukhun0627@gmail.com',
  'viall.blogger@gmail.com',
  't.goel@iitg.ac.in',
  'VISHV.SHAH008@SVKMMUMBAI.ONMICROSOFT.COM',
  'visheshpandey_23bae174@dtu.ac.in',
  '1602-23-733-308@vce.ac.in',
  // Add more emails as needed
]

export function isEmailWhitelisted(email: string): boolean {
  return WHITELISTED_EMAILS.includes(email.toLowerCase().trim())
}
