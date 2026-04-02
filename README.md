# Vibe Prospecting Clone

A professional B2B prospecting application powered by AI, similar to [Vibe Prospecting](https://app.vibeprospecting.ai/).

## Features

- **AI-Powered Chat** - Describe your ideal prospect in natural language and let AI help you find matches
- **Company Intelligence** - Search and view detailed company profiles including tech stack, revenue, and employee count
- **Contact Discovery** - Find key decision makers with verified contact information
- **Lead Management** - Save, organize, and track your prospects
- **Lead Lists** - Create custom lists to organize prospects by campaign, industry, or any criteria
- **Credits System** - Flexible pay-as-you-go credits for searches

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Prisma ORM with SQLite
- **State Management**: Zustand
- **AI Integration**: z-ai-web-dev-sdk

## Getting Started

### Prerequisites

- Node.js 18+
- Bun or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/cheick-sk/vibe-prospecting.git
cd vibe-prospecting

# Install dependencies
bun install

# Setup database
bun run db:push

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Authentication
│   │   │   ├── chat/      # AI Chat
│   │   │   ├── leads/     # Lead management
│   │   │   ├── lists/     # List management
│   │   │   └── search/    # Web search
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Main application
│   │   └── globals.css    # Global styles
│   ├── components/ui/     # shadcn/ui components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities
│   └── stores/            # Zustand stores
├── public/                # Static assets
└── db/                    # SQLite database
```

## Features Overview

### Landing Page
- Hero section with value proposition
- Features showcase
- Pricing plans

### Dashboard
- **AI Chat**: Conversational interface for prospecting
- **My Leads**: View and manage saved prospects
- **Companies**: Search and discover companies
- **Lead Lists**: Organize prospects into lists
- **Pricing**: View and upgrade plans

### Authentication
- Email/password signup
- Secure login with cookie-based sessions
- 400 free credits on signup

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth` | GET | Check auth status |
| `/api/auth` | POST | Login/Signup/Logout |
| `/api/chat` | POST | Send message to AI |
| `/api/chat` | GET | Get chat history |
| `/api/leads` | GET | Get all leads |
| `/api/leads` | POST | Create new lead |
| `/api/leads` | PUT | Update lead |
| `/api/leads` | DELETE | Delete lead |
| `/api/lists` | GET | Get all lists |
| `/api/lists` | POST | Create new list |
| `/api/lists` | DELETE | Delete list |
| `/api/search` | GET/POST | Search companies/contacts |

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./db/custom.db"
```

## Pricing Plans

| Plan | Credits | Price |
|------|---------|-------|
| Starter | 400 | Free |
| Professional | 2,500 | $49/month |
| Enterprise | 15,000 | $199/month |

## License

MIT License

## Author

Created as a clone of Vibe Prospecting for educational purposes.
