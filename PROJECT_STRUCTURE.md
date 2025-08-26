# GPAI Case Competition - Project Structure

## Overview
This is the file upload platform for the GPAI Case Competition, allowing registered participants to submit their case study presentations.

## Directory Structure

```
├── app/                      # Next.js 14 App Directory
│   ├── (auth)/              # Authentication pages (grouped route)
│   │   ├── sign-in/         # Sign in page
│   │   ├── sign-up/         # Sign up page (with GPAI verification)
│   │   ├── reset-password/  # Password reset request
│   │   └── update-password/ # Set new password after reset
│   ├── api/                 # API routes
│   │   └── auth/
│   │       └── verify-user/ # Verify user exists in GPAI database
│   ├── auth/                # Auth callback routes
│   │   ├── callback/        # Handle OAuth callbacks
│   │   └── confirm/         # Email confirmation handler
│   ├── dashboard/           # Protected dashboard pages
│   │   ├── page.tsx         # Main dashboard with status
│   │   ├── location/        # Step 1: Location selection
│   │   ├── information/     # Step 2: Participant information
│   │   └── upload/          # Step 3: File upload
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page (redirects to sign-in)
│
├── components/              # Reusable React components
│   └── ui/                  # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── toast.tsx
│       └── toaster.tsx
│
├── hooks/                   # Custom React hooks
│   └── use-toast.tsx        # Toast notification hook
│
├── lib/                     # Utility functions and configurations
│   ├── constants.ts         # App constants and configuration
│   ├── db.ts               # GPAI database connection
│   ├── email-validation.ts # Email validation logic
│   ├── supabase/           # Supabase client configurations
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client
│   │   └── middleware.ts   # Middleware client
│   └── utils.ts            # Utility functions
│
├── public/                  # Static files
│
└── middleware.ts            # Next.js middleware for auth
```

## Key Features

### 1. Authentication Flow
- **GPAI Verification**: Only users registered in the main GPAI database can create accounts
- **Email Verification**: Uses Supabase Auth with email confirmation
- **Password Reset**: Full password reset flow with email links

### 2. Submission Flow (3 Steps)
1. **Location Selection**: Choose competition city (23 Indian cities)
2. **Information Collection**: Participant details and reward email
3. **File Upload**: Submit case study (PDF/PPT/PPTX, max 20MB)

### 3. Data Storage
- **Supabase**: Authentication and participant information
- **GPAI Database**: User verification (PostgreSQL)
- **Storage**: File uploads in Supabase Storage with RLS

## Environment Variables

Required in `.env.local` and Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL= # GPAI PostgreSQL connection
```

## Security Features
- Row Level Security (RLS) on all tables
- User-isolated file storage
- GPAI database verification
- School email validation
- Protected routes with middleware

## Database Tables

### participant_info
- Stores participant submission details
- Links to auth.users via user_id
- Includes: name, email, location, college

### Storage Buckets
- `uploads/[user_id]/` - User submission files
- `uploads/public/` - Public files (case prompt)

## Deployment
- **Platform**: Vercel
- **Database**: Supabase + GPAI PostgreSQL
- **Email**: Supabase Auth (SMTP)