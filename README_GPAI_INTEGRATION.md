# GPAI Integration Setup Guide

## Overview
This Case Competition platform is integrated with the main GPAI authentication system. Users log in through gpai.app and their session is shared across subdomains.

## How It Works

1. **Authentication Flow**:
   - User clicks "Sign in" → Redirects to gpai.app/login
   - After login → Returns to case-competition.gpai.app/dashboard
   - Session cookie (`sessionId`) is shared across `*.gpai.app` domains

2. **User Data**:
   - User ID and email come from GPAI auth system
   - `participant_info` table stores competition-specific data
   - Files are stored in Supabase Storage under user's UUID

## Database Setup

### Required Tables

1. **participant_info** (Should already exist)
   - `user_id` (UUID) - GPAI user ID
   - `first_name`, `last_name`, `location`, `college`, etc.
   - No foreign key needed since users are in GPAI DB

### Storage Setup

1. Create a storage bucket named `uploads` in Supabase
2. Run the storage policies SQL:
   ```bash
   # In Supabase SQL Editor, run:
   setup-storage-policies-gpai.sql
   ```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Testing

1. Start dev server: `npm run dev`
2. Go to http://localhost:3002
3. Click "Sign in with GPAI Account"
4. Log in on gpai.app
5. Should redirect back to dashboard

## Troubleshooting

### "Not authenticated" errors
- Check if cookies are enabled
- Verify you're logged in at gpai.app
- Check browser console for CORS errors

### "Internal server error" on file operations
- Verify storage bucket exists
- Check storage policies are applied
- Ensure service role key is set

## Security Notes

- Authentication is handled by GPAI backend
- Storage security relies on API-level validation
- Never expose service role key to client