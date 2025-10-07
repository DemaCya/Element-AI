import type { Metadata } from "next";
import "./globals.css";
import SupabaseProvider from "@/components/SupabaseProvider";
import { UserProvider } from "@/contexts/UserContext";
import { structuredData, serviceStructuredData, faqStructuredData } from "./structured-data";

export const metadata: Metadata = {
  title: 'Cosmic Destiny AI - AI-Powered Chinese Astrology & Fortune Telling',
  description: 'Unlock your cosmic destiny with advanced AI analysis of your Bazi birth chart. Get personalized insights into personality, career, relationships, and life path. Free preview available.',
  keywords: [
    'Chinese astrology',
    'Bazi analysis',
    'fortune telling',
    'AI astrology',
    'birth chart',
    'destiny analysis',
    'personality insights',
    'career guidance',
    'relationship compatibility',
    'life path',
    'Chinese zodiac',
    'cosmic destiny'
  ],
  authors: [{ name: 'Cosmic Destiny AI' }],
  creator: 'Cosmic Destiny AI',
  publisher: 'Cosmic Destiny AI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'Cosmic Destiny AI - AI-Powered Chinese Astrology & Fortune Telling',
    description: 'Unlock your cosmic destiny with advanced AI analysis of your Bazi birth chart. Get personalized insights into personality, career, relationships, and life path.',
    siteName: 'Cosmic Destiny AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cosmic Destiny AI - AI-Powered Chinese Astrology & Fortune Telling',
    description: 'Unlock your cosmic destiny with advanced AI analysis of your Bazi birth chart. Get personalized insights into personality, career, relationships, and life path.',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  verification: {
    google: 'verification_token_here',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceStructuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
      </head>
      <body className="min-h-screen bg-slate-950 text-white antialiased">
        <SupabaseProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
