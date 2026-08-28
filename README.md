# UnsaidWords

A private archive for the feelings you never said out loud — gratitude, apologies, admiration, or frustration you kept to yourself. Built with Next.js, TypeScript, and Supabase.

## Live Website

https://unsaid-words-five.vercel.app

## Overview

UnsaidWords lets you privately record feelings toward people you never voiced them to. Entries are tied to your account only. The app schedules gentle follow-ups to ask whether a feeling has changed over time.

## Features

* Private, per-user archive protected by Supabase Row Level Security
* Categorized entries: Gratitude, Apology, Admiration, Frustration
* Scheduled follow-ups (1 week / 1 month / 3 months) with status tracking
* Authentication (sign up, login, protected routes)
* Insights view for patterns across entries
* PDF export in Arabic and English
* Installable PWA with offline support
* Fully responsive design

## Built With

* Next.js
* TypeScript
* Tailwind CSS
* Supabase (Auth, PostgreSQL, RLS)
* Lucide React

## Getting Started

Clone the repository:

```
git clone https://github.com/SHAHENDA78/unsaid-words.git
```

Navigate to the project:

```
cd unsaid-words
```

Install dependencies:

```
npm install
```

Add environment variables in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

Run the development server:

```
npm run dev
```

Open your browser:

```
http://localhost:3000
```

## Database

**feelings** table — id, user_id, type, person_name, content, created_at, follow_up_at, follow_up_status. Protected by Row Level Security so each user only accesses their own entries.

## Contact

LinkedIn: https://www.linkedin.com/in/shahenda-shaheen-6a907423b
GitHub: https://github.com/SHAHENDA78
Email: shahendashaheen1@gmail.com
