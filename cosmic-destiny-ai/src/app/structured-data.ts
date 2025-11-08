export const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Star Whisper AI",
  "description": "AI-powered Chinese astrology and Bazi analysis for personal insights",
  "url": process.env.NEXT_PUBLIC_APP_URL,
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${process.env.NEXT_PUBLIC_APP_URL}/search?query={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Star Whisper AI",
    "logo": {
      "@type": "ImageObject",
      "url": `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`
    }
  }
}

export const serviceStructuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Cosmic Destiny Analysis",
  "description": "Personalized Chinese astrology and Bazi birth chart analysis using AI technology",
  "provider": {
    "@type": "Organization",
    "name": "Star Whisper AI"
  },
  "serviceType": "Astrology Consultation",
  "areaServed": "Worldwide",
  "offers": {
    "@type": "Offer",
    "price": "4.49",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}

export const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does Star Whisper AI work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We combine traditional Chinese astrology (Bazi) with advanced AI analysis. Simply provide your birth details, and our system will generate a comprehensive personality and destiny report based on ancient wisdom and modern insights."
      }
    },
    {
      "@type": "Question",
      "name": "Is this based on real astrology or science?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our system uses authentic Bazi calculations combined with AI-powered analysis. While not scientifically proven, millions have found value in these ancient wisdom traditions for self-discovery and personal growth."
      }
    },
    {
      "@type": "Question",
      "name": "What's included in the full report?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The complete report includes detailed personality analysis, career guidance, relationship insights, life path predictions, and health considerations. Each report is personalized based on your unique birth data."
      }
    },
    {
      "@type": "Question",
      "name": "How much does the full report cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The full cosmic destiny report costs $4.49 USD. We offer a free preview with 15% of the content available at no cost."
      }
    },
    {
      "@type": "Question",
      "name": "Is this website free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The preview report is free. If you find the AI-generated insights accurate, you can then purchase the full report."
      }
    }
  ]
}