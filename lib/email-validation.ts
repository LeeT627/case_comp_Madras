// Common temporary/disposable email domains
const TEMPORARY_EMAIL_DOMAINS = [
  // Most common temporary email services
  'tempmail.com',
  'guerrillamail.com',
  'mailinator.com',
  '10minutemail.com',
  'throwaway.email',
  'yopmail.com',
  'maildrop.cc',
  'getairmail.com',
  'fakeinbox.com',
  'trashmail.com',
  'sharklasers.com',
  'spam4.me',
  'nada.email',
  'temp-mail.org',
  'temporarymail.net',
  'throwawaymail.com',
  'getnada.com',
  'tempmail.net',
  'tempmailaddress.com',
  'tempinbox.com',
  'burnermail.io',
  'mailnesia.com',
  '10minutemail.net',
  'spambox.us',
  'throwaway.in',
  'mintemail.com',
  'tempmail.ninja',
  'emailondeck.com',
  'mohmal.com',
  'tmpmail.org',
  'tmpmail.net',
  'tmpeml.info',
  'instantmail.fr',
  'email-fake.com',
  'fakemailbox.com',
  'trash-mail.com',
  'mailcatch.com',
  'mailnull.com',
  'my10minutemail.com',
  'mailforspam.com',
  'emailfake.com',
  'email-fake.co.uk',
  'temp-inbox.com',
  'disposablemail.com',
  'wegwerfmail.de',
  'trash-mail.de',
  'temporaryinbox.com',
  'spamgourmet.com',
  'spambox.info',
  'spambox.org',
  'spambox.xyz',
  'spambox.me'
]

// Common personal email domains that should be blocked
const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.fr',
  'yahoo.de',
  'yahoo.es',
  'yahoo.it',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'protonmail.com',
  'proton.me',
  'zoho.com',
  'yandex.com',
  'mail.com',
  'gmx.com',
  'gmx.net',
  'fastmail.com',
  'tutanota.com',
  'tutanota.de',
  'mailbox.org',
  'posteo.de',
  'runbox.com',
  'qq.com',
  '163.com',
  '126.com',
  'sina.com',
  'foxmail.com'
]

export interface EmailValidationResult {
  isValid: boolean
  error?: string
}

export function validateEmail(email: string): EmailValidationResult {
  if (!email) {
    return {
      isValid: false,
      error: 'Email address is required'
    }
  }

  const emailLower = email.toLowerCase().trim()
  const domain = emailLower.split('@')[1]

  if (!domain) {
    return {
      isValid: false,
      error: 'Invalid email format'
    }
  }

  // Check for Gmail and other personal email providers
  if (PERSONAL_EMAIL_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      error: 'Please use your school email address. Personal email addresses are not allowed.'
    }
  }

  // Check for temporary email domains
  if (TEMPORARY_EMAIL_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      error: 'Temporary or disposable email addresses are not allowed. Please use your school email.'
    }
  }

  // Check for subdomains of temporary email services
  const isDomainTemporary = TEMPORARY_EMAIL_DOMAINS.some(tempDomain => 
    domain.endsWith(`.${tempDomain}`) || domain === tempDomain
  )
  
  if (isDomainTemporary) {
    return {
      isValid: false,
      error: 'Temporary or disposable email addresses are not allowed. Please use your school email.'
    }
  }

  // Additional check: ensure it looks like an educational email
  // Common educational TLDs and keywords
  const educationalIndicators = [
    '.edu',
    '.ac.',
    '.school',
    'university',
    'college',
    'institut',
    'academy',
    'scholar'
  ]

  const hasEducationalIndicator = educationalIndicators.some(indicator => 
    domain.includes(indicator)
  )

  // If no educational indicator found, show a warning but don't block
  // (some schools use regular domains)
  if (!hasEducationalIndicator) {
    // We'll still allow it but the GPAI database check will be the final validator
    return {
      isValid: true
    }
  }

  return {
    isValid: true
  }
}

// Helper function to check if email is likely a school email
export function isLikelySchoolEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1]
  if (!domain) return false

  const educationalIndicators = [
    '.edu',
    '.ac.',
    '.school',
    'university',
    'college',
    'institut',
    'academy'
  ]

  return educationalIndicators.some(indicator => domain.includes(indicator))
}