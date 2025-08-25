export const APP_NAME = 'GPAI Case Competition'
export const APP_AUTHOR = 'by TeamTuring'

export const FILE_UPLOAD = {
  MAX_SIZE: 20 * 1024 * 1024, // 20MB
  ALLOWED_EXTENSIONS: ['pdf', 'ppt', 'pptx'],
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
}

export const AUTH_MESSAGES = {
  SCHOOL_EMAIL_WARNING: 'Please use your SCHOOL email used to sign up to gpai.app. Other addresses will not be able to enter competition.',
  SPAM_FOLDER_WARNING: "If you don't see your verification email, please check your spam folder.",
  ACCESS_DENIED: 'Only registered GPAI Competition participants can access this platform.',
  PASSWORD_MIN_LENGTH: 6,
  GMAIL_BLOCKED: 'Please use your school email address. Personal email addresses like Gmail are not allowed.',
  TEMP_EMAIL_BLOCKED: 'Temporary or disposable email addresses are not allowed. Please use your school email.'
}

export const ROUTES = {
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  DASHBOARD: '/dashboard',
  RESET_PASSWORD: '/reset-password',
  UPDATE_PASSWORD: '/update-password'
}