# File Upload Application

A modern web application for file uploads with authentication, built with Next.js, Supabase, and Tailwind CSS.

## Features

- User authentication (Sign up, Sign in, Password reset)
- File upload support for PDF and PowerPoint files (max 20MB)
- Dashboard with file management
- Deadline display
- Modern, responsive UI with Shadcn/UI components

## Tech Stack

- **Framework:** Next.js 15 with TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **Authentication & Database:** Supabase
- **Email Service:** Resend
- **Deployment:** Vercel

## Prerequisites

Before you begin, you'll need:

1. A [Supabase](https://supabase.com) account and project
2. A [Resend](https://resend.com) account for email services
3. A [Vercel](https://vercel.com) account for deployment

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd file-upload-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Supabase

1. Create a new project in Supabase
2. Go to Settings > API to get your project URL and anon key
3. Create a storage bucket named "uploads" in Storage settings
4. Set up the following RLS policies for the "uploads" bucket:
   - Allow authenticated users to upload files
   - Allow authenticated users to view their own files

### 4. Configure Resend

1. Sign up for Resend
2. Get your API key from the dashboard
3. Configure your domain for sending emails

### 5. Set up environment variables

Create a `.env.local` file in the root directory and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add the environment variables in Vercel's dashboard
4. Deploy

The application will automatically deploy on every push to the main branch.

## Project Structure

```
file-upload-app/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── reset-password/
│   ├── dashboard/
│   └── layout.tsx
├── components/
│   └── ui/
├── lib/
│   └── supabase/
├── public/
└── package.json
```

## Usage

1. **Sign Up:** Create a new account with email and password
2. **Sign In:** Log in with your credentials
3. **Upload Files:** Navigate to dashboard and upload PDF/PPT files
4. **View Files:** See all your uploaded files in the dashboard
5. **Password Reset:** Use the forgot password feature if needed

## License

MIT
