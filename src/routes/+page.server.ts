export function load() {
  return {
    seo: {
      title: 'ChatWii - Anonymous Private Chat',
      description: 'Private 1-on-1 anonymous text chat with no registration required. Instant messaging platform built for privacy-first conversations. Start chatting securely in seconds.',
      keywords: ['anonymous chat', 'private messaging', 'secure chat', 'no registration', 'instant messaging', 'privacy-first chat', 'stranger chat'],
      canonical: 'https://chatwii.com',
      image: {
        url: 'https://chatwii.com/images/og-image.jpg',
        alt: 'ChatWii anonymous private chat interface'
      },
      schema: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "ChatWii",
        "url": "https://chatwii.com",
        "description": "Anonymous 1-on-1 text chat platform with no registration required. Private, secure real-time messaging focused on user privacy.",
        "applicationCategory": "CommunicationApplication",
        "applicationSubCategory": "Messaging",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "Anonymous authentication",
          "Real-time 1-on-1 messaging",
          "No personal data collection",
          "Privacy-first design",
          "No registration required",
          "Instant messaging",
          "End-to-end encrypted conversations"
        ],
        "softwareVersion": "1.0",
        "inLanguage": "en",
        "screenshot": "https://chatwii.com/images/screenshot.jpg"
      }
    }
  };
}
