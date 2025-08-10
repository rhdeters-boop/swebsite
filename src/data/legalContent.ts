export interface LegalDocument {
  id: string;
  title: string;
  slug: string;
  category: 'legal' | 'safety' | 'community';
  content: string;
  lastUpdated: string;
  version: string;
  sections: {
    id: string;
    title: string;
    content: string;
  }[];
}

export const legalDocuments: LegalDocument[] = [
  {
    id: 'terms-of-service',
    title: 'Terms of Service',
    slug: 'terms',
    category: 'legal',
    version: '2.0',
    lastUpdated: '2024-01-01',
    content: 'Full terms of service content...',
    sections: [
      {
        id: 'acceptance',
        title: '1. Acceptance of Terms',
        content: `By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`,
      },
      {
        id: 'use-license',
        title: '2. Use License',
        content: `Permission is granted to temporarily access the materials (information or software) on our platform for personal, non-commercial transitory viewing only.`,
      },
      {
        id: 'user-accounts',
        title: '3. User Accounts',
        content: `When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.`,
      },
      {
        id: 'content-guidelines',
        title: '4. Content Guidelines',
        content: `Users are responsible for all content they post. Content must not violate any applicable laws, infringe on intellectual property rights, or contain harmful or offensive material.`,
      },
      {
        id: 'payment-terms',
        title: '5. Payment Terms',
        content: `All subscriptions are billed in advance on a monthly basis and are non-refundable. You may cancel your subscription at any time, and it will remain active until the end of the billing period.`,
      },
      {
        id: 'termination',
        title: '6. Termination',
        content: `We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.`,
      },
    ],
  },
  {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    slug: 'privacy',
    category: 'legal',
    version: '2.0',
    lastUpdated: '2024-01-01',
    content: 'Full privacy policy content...',
    sections: [
      {
        id: 'information-collection',
        title: '1. Information We Collect',
        content: `We collect information you provide directly to us, such as when you create an account, subscribe to a creator, or contact us for support.`,
      },
      {
        id: 'information-use',
        title: '2. How We Use Your Information',
        content: `We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.`,
      },
      {
        id: 'information-sharing',
        title: '3. Information Sharing',
        content: `We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.`,
      },
      {
        id: 'data-security',
        title: '4. Data Security',
        content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.`,
      },
      {
        id: 'cookies',
        title: '5. Cookies and Tracking',
        content: `We use cookies and similar tracking technologies to track activity on our platform and hold certain information to improve your experience.`,
      },
      {
        id: 'user-rights',
        title: '6. Your Rights',
        content: `You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.`,
      },
    ],
  },
  {
    id: 'community-guidelines',
    title: 'Community Guidelines',
    slug: 'community-guidelines',
    category: 'community',
    version: '1.5',
    lastUpdated: '2024-01-15',
    content: 'Full community guidelines content...',
    sections: [
      {
        id: 'respect',
        title: '1. Respect Everyone',
        content: `Treat all members of our community with respect. Harassment, hate speech, and discrimination of any kind will not be tolerated.`,
      },
      {
        id: 'authentic-content',
        title: '2. Keep Content Authentic',
        content: `Share content that is genuine and original. Do not impersonate others or post misleading information.`,
      },
      {
        id: 'safety',
        title: '3. Prioritize Safety',
        content: `Do not post content that could harm others, including content that promotes dangerous activities, self-harm, or violence.`,
      },
      {
        id: 'privacy-respect',
        title: '4. Respect Privacy',
        content: `Do not share private information about others without their consent. This includes personal details, contact information, or private conversations.`,
      },
      {
        id: 'legal-compliance',
        title: '5. Follow the Law',
        content: `All content and activities must comply with applicable laws. Illegal content will be removed and may result in account termination.`,
      },
      {
        id: 'reporting',
        title: '6. Report Violations',
        content: `If you see content or behavior that violates these guidelines, please report it using our reporting tools.`,
      },
    ],
  },
  {
    id: 'creator-agreement',
    title: 'Creator Agreement',
    slug: 'creator-agreement',
    category: 'legal',
    version: '1.0',
    lastUpdated: '2024-01-01',
    content: 'Full creator agreement content...',
    sections: [
      {
        id: 'eligibility',
        title: '1. Creator Eligibility',
        content: `To become a creator, you must be at least 18 years old and have the legal capacity to enter into this agreement.`,
      },
      {
        id: 'content-ownership',
        title: '2. Content Ownership',
        content: `You retain ownership of your content, but grant us a license to use, display, and distribute your content on our platform.`,
      },
      {
        id: 'monetization',
        title: '3. Monetization Terms',
        content: `Creators receive 80% of subscription revenue after payment processing fees. Payments are made monthly for the previous month's earnings.`,
      },
      {
        id: 'content-standards',
        title: '4. Content Standards',
        content: `All creator content must comply with our community guidelines and content policies. Violations may result in content removal or account suspension.`,
      },
      {
        id: 'tax-responsibilities',
        title: '5. Tax Responsibilities',
        content: `Creators are responsible for all taxes related to their earnings. We will provide necessary tax documentation as required by law.`,
      },
    ],
  },
  {
    id: 'copyright-policy',
    title: 'Copyright Policy',
    slug: 'copyright',
    category: 'legal',
    version: '1.0',
    lastUpdated: '2024-01-01',
    content: 'Full copyright policy content...',
    sections: [
      {
        id: 'dmca-compliance',
        title: '1. DMCA Compliance',
        content: `We respect the intellectual property rights of others and expect our users to do the same. We will respond to clear notices of alleged copyright infringement.`,
      },
      {
        id: 'reporting-infringement',
        title: '2. Reporting Copyright Infringement',
        content: `If you believe your copyrighted work has been copied in a way that constitutes copyright infringement, please provide us with a DMCA notice.`,
      },
      {
        id: 'counter-notice',
        title: '3. Counter-Notice Procedure',
        content: `If you believe your content was wrongly removed due to a copyright claim, you may submit a counter-notice with required information.`,
      },
      {
        id: 'repeat-infringers',
        title: '4. Repeat Infringer Policy',
        content: `We will terminate the accounts of users who are repeat infringers of intellectual property rights.`,
      },
    ],
  },
  {
    id: 'safety-center',
    title: 'Safety Center',
    slug: 'safety',
    category: 'safety',
    version: '1.0',
    lastUpdated: '2024-01-15',
    content: 'Full safety center content...',
    sections: [
      {
        id: 'online-safety',
        title: '1. Staying Safe Online',
        content: `Tips for protecting yourself online, including password security, recognizing scams, and maintaining privacy.`,
      },
      {
        id: 'reporting-concerns',
        title: '2. Reporting Safety Concerns',
        content: `How to report content or users that make you feel unsafe, and what happens after you make a report.`,
      },
      {
        id: 'blocking-tools',
        title: '3. Using Blocking Tools',
        content: `How to block users, filter content, and use other safety features to customize your experience.`,
      },
      {
        id: 'youth-safety',
        title: '4. Youth Safety',
        content: `Information for parents and guardians about keeping young users safe on our platform.`,
      },
      {
        id: 'crisis-resources',
        title: '5. Crisis Resources',
        content: `If you or someone you know is in crisis, here are resources that can help provide immediate support.`,
      },
    ],
  },
];

// Helper functions
export function getLegalDocument(slug: string): LegalDocument | undefined {
  return legalDocuments.find(doc => doc.slug === slug);
}

export function getLegalDocumentsByCategory(category: 'legal' | 'safety' | 'community'): LegalDocument[] {
  return legalDocuments.filter(doc => doc.category === category);
}

export function searchLegalDocuments(query: string): LegalDocument[] {
  const normalizedQuery = query.toLowerCase();
  return legalDocuments.filter(doc =>
    doc.title.toLowerCase().includes(normalizedQuery) ||
    doc.content.toLowerCase().includes(normalizedQuery) ||
    doc.sections.some(section =>
      section.title.toLowerCase().includes(normalizedQuery) ||
      section.content.toLowerCase().includes(normalizedQuery)
    )
  );
}