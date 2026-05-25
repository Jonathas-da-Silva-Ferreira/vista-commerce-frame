// Institutional copy centralized in a single source of truth.
// - Decoupling: components RENDER, they don't know the content.
// - Swappable: pointing at a CMS later (Strapi, Sanity) only requires changing
//   the mockServer handler — types and components stay identical.

import type { AboutContent, HistoryContent, TermsContent } from '@/types';

// --- About --------------------------------------------------------------------
// Modeled as an array of sections (instead of named fields like mission/vision)
// so marketing can add/remove blocks without any code change.
export const aboutContent: AboutContent = {
  companyName: 'Nexora',
  tagline: 'The marketplace that connects sellers and buyers worldwide.',
  description:
    "We're a modern e-commerce platform built to democratize access to digital commerce — offering professional tools to sellers of every size and a safe, modern shopping experience to millions of customers.",
  sections: [
    {
      id: 'who-we-are',
      title: 'Who We Are',
      body: 'Nexora was founded in 2024 with the mission of simplifying online commerce. We bring together technology, smart logistics, and seller curation to deliver a buying experience that is reliable, fast, and fair for everyone involved.',
    },
    {
      id: 'mission',
      title: 'Our Mission',
      body: 'Connect people to the products that transform their day-to-day, offering a fair, secure, and accessible platform for sellers of all sizes.',
    },
    {
      id: 'vision',
      title: 'Our Vision',
      body: 'To become, by 2030, the most trusted marketplace in the world — recognized for the quality of its experience and the strength of its seller community.',
    },
    {
      id: 'values',
      title: 'Our Values',
      body: 'Transparency in every transaction, respect for the customer, support for small entrepreneurs, continuous innovation, and social responsibility in everything we do.',
    },
  ],
};

// --- History (timeline) -------------------------------------------------------
// Ordered array so the chronological sequence is preserved and the page can
// render it as a simple vertical timeline.
export const historyContent: HistoryContent = {
  title: 'Our History',
  intro: 'From the initial idea to a global marketplace — meet the milestones that shaped Nexora.',
  milestones: [
    {
      year: '2024',
      title: 'Company founded',
      description:
        'A small team of engineers and entrepreneurs came together to build a fairer, more modern marketplace for online commerce.',
    },
    {
      year: '2025',
      title: 'Platform launch',
      description:
        'We shipped the first public version of Nexora with more than 500 partner sellers and logistics coverage across all major cities.',
    },
    {
      year: '2026',
      title: 'Marketplace expansion',
      description:
        'We reached 10,000 active sellers, opened distribution centers in five regions, and launched our smart-shipping program.',
    },
    {
      year: '2027',
      title: 'Smart marketplace',
      description:
        'Investments in personalized recommendations, distance-based logistics optimization, and advanced tools for professional sellers.',
    },
  ],
};

// --- Terms of Use -------------------------------------------------------------
// Section structure enables consistent typography and a future auto-generated
// table of contents without changes to the underlying data.
export const termsContent: TermsContent = {
  title: 'Terms of Use',
  lastUpdated: '2026-01-15',
  intro:
    "By using Nexora, you agree to the terms described below. Please read them carefully before signing up or making any purchase on the platform.",
  sections: [
    {
      id: 'platform-use',
      title: '1. Platform Use',
      body: 'Nexora grants users a personal, non-exclusive, and non-transferable license to use the site and its services for lawful purposes. Any use that violates current laws, third-party rights, or commercial best practices is prohibited.',
    },
    {
      id: 'user-responsibility',
      title: '2. User Responsibility',
      body: 'Users are responsible for the accuracy of the information provided at registration, for safeguarding their access credentials, and for all actions taken under their account. Buyers and sellers must maintain respectful communication on the platform.',
    },
    {
      id: 'sales-policy',
      title: '3. Sales Policy',
      body: 'Sellers must offer lawful products, describe their characteristics accurately, keep stock up to date, and meet established deadlines. Nexora may suspend listings that violate these rules or receive repeated complaints.',
    },
    {
      id: 'delivery-policy',
      title: '4. Delivery Policy',
      body: 'The delivery window shown at checkout combines the seller\'s preparation time with the selected carrier\'s estimated transit time. Any delays should be reported to support and will be handled in line with consumer protection regulations.',
    },
    {
      id: 'cancellation-policy',
      title: '5. Cancellation and Return Policy',
      body: 'Buyers may withdraw from a purchase within 7 calendar days of receiving the product. Cancellations before shipment can be requested directly from the "My Orders" panel at no extra cost.',
    },
    {
      id: 'privacy',
      title: '6. Privacy and Data Protection',
      body: 'We collect and process personal data in accordance with applicable data protection laws. Information is used to process orders, improve the experience, and comply with legal obligations — it is never sold to third parties.',
    },
    {
      id: 'changes',
      title: '7. Changes to the Terms',
      body: 'Nexora may update these terms at any time. Material changes will be communicated by email or banner on the platform at least 15 days in advance.',
    },
  ],
};
