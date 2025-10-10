# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cosmic Destiny AI is a Chinese astrology and fortune-telling web application that combines traditional Bazi (八字) calculations with AI-powered analysis. The application generates personalized destiny reports based on users' birth data using Chinese astrology principles and Google's Gemini AI for detailed interpretations.

## Architecture

The application is built with Next.js 15 using the App Router architecture and static export deployment:

- **Frontend**: React 19 with TypeScript, Tailwind CSS, and Three.js for 3D visualizations
- **Backend**: Next.js API routes with Supabase for database and authentication
- **AI Integration**: Google Gemini API for generating personalized astrology reports
- **Astrology Engine**: Bazi calculator library for traditional Chinese astrology computations
- **Database**: Supabase PostgreSQL with user profiles, reports, and payments tables
- **Deployment**: Static export (`output: 'export'`) optimized for Vercel

## Development Commands

### Environment Setup
All development commands enforce UTC timezone to ensure consistent Bazi calculations:

```bash
# Development server with UTC timezone
npm run dev

# Build for production with Turbopack (UTC enforced)
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format

# Bundle analysis
npm run analyze

# Deploy to production
npm run deploy
```

### Testing
The project currently uses manual testing through browser interaction. No automated test framework is configured.

## Key Components

### Core Services

- **BaziService** (`src/services/baziService.ts:4`): Handles Bazi calculations using the `@aharris02/bazi-calculator-by-alvamind` library. Includes fallback mock data generation for testing and comprehensive timezone handling.

- **GeminiService** (`src/services/geminiService.ts:4`): Manages AI report generation using Google's Gemini 2.5 Flash model for personality, career, relationship, health, and life path analysis. Supports both preview (500-800 words) and comprehensive (3000+ words) reports.

- **StarSystem** (`src/components/StarSystem.tsx:11`): Three.js-based 3D visualization of the five elements (五行) orbiting around a central star with responsive design.

### Database Schema

The application uses three main tables:
- **profiles**: User account information linked to Supabase auth
- **user_reports**: Stores generated astrology reports with Bazi data and AI analysis
- **payments**: Payment processing records for premium report upgrades

### Authentication & User Management

- Uses Supabase Auth for user authentication
- User context managed through `UserContext` (`src/contexts/UserContext.tsx`)
- Authentication flow with modal-based login/registration
- Singleton Supabase client pattern to prevent multiple instances (`src/lib/supabase/client.ts`)

### Logging System

- **PersistentLogger** (`src/lib/logger.ts`): Custom logging system that persists logs across page navigation and console clears
- Exposes debugging utilities via `window.cosmicLogger` in browser
- Includes specialized Supabase logging with emoji indicators

## Key Features

### Report Generation Flow
1. User enters birth data via `BirthForm` component with timezone selection
2. System calculates Bazi (Chinese astrology) data with UTC timezone enforcement
3. Generates preview report (500-800 words) using Gemini AI
4. Stores report in database with `is_paid: false`
5. User can upgrade to full report (3000+ words) via payment

### Five Elements Integration
The application incorporates the five Chinese elements (五行):
- 金 (Metal) - Gold color
- 木 (Wood) - Green color
- 水 (Water) - Blue color
- 火 (Fire) - Red color
- 土 (Earth) - Brown color

These are visualized in the 3D star system and used in Bazi calculations.

### Timezone Handling
- **Critical for accurate Bazi calculations**
- UTC timezone enforced in all development commands and Next.js config
- BirthForm includes timezone selection for users
- Fallback to 12:00 PM when birth time is unknown

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_GEMINI_API_KEY`: Google Gemini API key for AI report generation
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for server operations

## File Structure

```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── api/            # API endpoints for reports and health checks
│   └── auth/           # Authentication pages and callbacks
├── components/          # React components (UI, forms, visualizations)
│   ├── auth/           # Authentication components
│   └── ui/             # Reusable UI components
├── contexts/           # React contexts for state management
├── lib/                # Utility libraries and database types
│   ├── supabase/       # Supabase client configuration
│   └── logger.ts       # Persistent logging system
├── services/           # Business logic services (Bazi, Gemini AI)
└── types/              # TypeScript type definitions
```

## Architecture Patterns

### Static Export Configuration
- Uses `output: 'export'` for static site generation
- Optimized for Vercel deployment
- Image optimization disabled for static builds
- Trailing slash handling configured

### Singleton Pattern for Supabase
- Global client instance to prevent multiple connections
- Creation count tracking for debugging
- Reset functionality for testing scenarios

### Error Handling & Fallbacks
- Mock Bazi data generation when calculator library fails
- Graceful degradation for missing dependencies
- Comprehensive logging for debugging issues

## Important Notes

- The application uses Chinese language throughout the UI
- Timezone handling is critical for accurate Bazi calculations (UTC enforced)
- The 3D star system uses Three.js with responsive design
- All AI-generated content includes upsell prompts for full reports
- Mock data generation is available for testing when dependencies are missing
- Persistent logging system helps debug issues across page navigation
- Static export deployment requires careful handling of dynamic features