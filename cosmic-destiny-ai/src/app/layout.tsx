import type { Metadata } from "next";
import "./globals.css";
import { SupabaseProvider } from "@/contexts/SupabaseContext";
import { UserProvider } from "@/contexts/UserContext";
import { structuredData, serviceStructuredData, faqStructuredData } from "./structured-data";
import { existsSync } from "fs";
import path from "path";

// 调试：检查图标文件是否存在
const appDir = path.join(process.cwd(), "src/app");
const iconFiles = {
  iconIco: path.join(appDir, "icon.ico"),
  iconPng: path.join(appDir, "icon.png"),
  appleIcon: path.join(appDir, "apple-icon.png"),
  faviconIco: path.join(process.cwd(), "public/favicon.ico"),
};

console.log("🔍 [ICON DEBUG] 检查图标文件:");
Object.entries(iconFiles).forEach(([name, filePath]) => {
  const exists = existsSync(filePath);
  console.log(`  ${name}: ${exists ? "✅ 存在" : "❌ 不存在"} - ${filePath}`);
});

export const metadata: Metadata = {
  title: 'Star Whisper AI - AI-Powered Personal Insights & Analysis',
  description: 'Discover your future with Star Whisper AI. We provide advanced AI analysis of your Bazi birth chart for personalized insights into your personality, career, relationships, and life path. Get your free preview today.',
  keywords: [
    'Chinese astrology',
    'Bazi analysis',
    'personal analysis',
    'AI astrology',
    'birth chart',
    'path analysis',
    'personality insights',
    'career guidance',
    'relationship compatibility',
    'life path',
    'Chinese zodiac',
    'personal growth'
  ],
  authors: [{ name: 'Star Whisper AI' }],
  creator: 'Star Whisper AI',
  publisher: 'Star Whisper AI',
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
    title: 'Star Whisper AI - AI-Powered Personal Insights & Analysis',
    description: 'Discover your future with Star Whisper AI. We provide advanced AI analysis of your Bazi birth chart for personalized insights into your personality, career, relationships, and life path.',
    siteName: 'Star Whisper AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Star Whisper AI - AI-Powered Personal Insights & Analysis',
    description: 'Discover your future with Star Whisper AI. We provide advanced AI analysis of your Bazi birth chart for personalized insights into your personality, career, relationships, and life path.',
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
