# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cosmic Destiny AI is a Chinese astrology and fortune-telling web application that combines traditional Bazi (八字) calculations with AI-powered analysis. The application generates personalized destiny reports based on users' birth data using Chinese astrology principles and Google's Gemini AI for detailed interpretations.

## Architecture

The application is built with Next.js 15 using the App Router architecture and features:

- **Frontend**: React 19 with TypeScript, Tailwind CSS, and Three.js for 3D visualizations
- **Backend**: Next.js API routes with Supabase for database and authentication
- **AI Integration**: Google Gemini API for generating personalized astrology reports
- **Astrology Engine**: Bazi calculator library for traditional Chinese astrology computations
- **Database**: Supabase PostgreSQL with user profiles, reports, and payments tables

## Key Components

### Core Services

- **BaziService** (`src/services/baziService.ts:4`): Handles Bazi calculations using the `@aharris02/bazi-calculator-by-alvamind` library. Includes fallback mock data generation for testing.
- **GeminiService** (`src/services/geminiService.ts:4`): Manages AI report generation using Google's Gemini 2.5 Flash model for personality, career, relationship, and life path analysis.
- **StarSystem** (`src/components/StarSystem.tsx:11`): Three.js-based 3D visualization of the five elements (五行) orbiting around a central star.

### Database Schema

The application uses three main tables:
- **profiles**: User account information linked to Supabase auth
- **user_reports**: Stores generated astrology reports with Bazi data and AI analysis
- **payments**: Payment processing records for premium report upgrades

### Authentication & User Management

- Uses Supabase Auth for user authentication
- User context managed through `UserContext` (`src/contexts/UserContext.tsx`)
- Authentication flow with modal-based login/registration

## Development Commands

### Common Development Tasks
```bash
# Development server with UTC timezone
npm run dev

# Build for production with Turbopack
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
```

### Testing
The project currently uses manual testing through browser interaction. No automated test framework is configured.

## Key Features

### Report Generation Flow
1. User enters birth data via `BirthForm` component
2. System calculates Bazi (Chinese astrology) data
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

### Payment Integration
- Payment system for upgrading from preview to full reports
- Payment records stored in Supabase with transaction tracking
- Support for multiple payment providers

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
├── components/          # React components (UI, forms, visualizations)
├── contexts/           # React contexts for state management
├── lib/                # Utility libraries and database types
├── services/           # Business logic services (Bazi, Gemini AI)
└── types/              # TypeScript type definitions
```

## Important Notes

- The application uses Chinese language throughout the UI
- Timezone handling is critical for accurate Bazi calculations (UTC enforced)
- The 3D star system uses Three.js with responsive design
- All AI-generated content includes upsell prompts for full reports
- Mock data generation is available for testing when dependencies are missing