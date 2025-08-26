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
  DASHBOARD_LOCATION: '/dashboard/location',
  DASHBOARD_INFORMATION: '/dashboard/information',
  DASHBOARD_UPLOAD: '/dashboard/upload',
  RESET_PASSWORD: '/reset-password'
}

export const LOCATIONS = [
  { value: 'bhubaneswar', label: 'Bhubaneswar', available: true },
  { value: 'chennai', label: 'Chennai', available: true },
  { value: 'delhi', label: 'Delhi', available: true },
  { value: 'dhanbad', label: 'Dhanbad', available: true },
  { value: 'dharwad', label: 'Dharwad', available: true },
  { value: 'gandhinagar', label: 'Gandhinagar', available: true },
  { value: 'goa', label: 'Goa', available: true },
  { value: 'guwahati', label: 'Guwahati', available: true },
  { value: 'hyderabad', label: 'Hyderabad', available: true },
  { value: 'indore', label: 'Indore', available: true },
  { value: 'jammu', label: 'Jammu', available: true },
  { value: 'jodhpur', label: 'Jodhpur', available: true },
  { value: 'kanpur', label: 'Kanpur', available: true },
  { value: 'kharagpur', label: 'Kharagpur', available: true },
  { value: 'mandi', label: 'Mandi', available: true },
  { value: 'mumbai', label: 'Mumbai', available: true },
  { value: 'palakkad', label: 'Palakkad', available: true },
  { value: 'patna', label: 'Patna', available: true },
  { value: 'roorkee', label: 'Roorkee', available: true },
  { value: 'ropar', label: 'Ropar', available: true },
  { value: 'tirupati', label: 'Tirupati', available: true },
  { value: 'varanasi', label: 'Varanasi', available: true },
]

export const COLLEGES = [
  'IIT Delhi - Indian Institute of Technology',
  'Jamia Millia Islamia',
  'DTU - Delhi Technological University',
  'Amity University, Noida',
  'NIT Delhi - National Institute of Technology',
  'Netaji Subhas University of Technology',
  'IIIT Delhi - Indraprastha Institute of Information Technology',
  'Guru Gobind Singh Indraprastha University',
  'Other'
]