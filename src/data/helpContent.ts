export interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory?: string;
  content: string;
  relatedArticles?: string[];
  keywords: string[];
  lastUpdated: string;
  readTime: number; // in minutes
  helpful?: {
    yes: number;
    no: number;
  };
}

export interface HelpCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  subcategories?: {
    id: string;
    name: string;
    slug: string;
  }[];
  order: number;
}

export const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    slug: 'getting-started',
    description: 'New to our platform? Start here',
    icon: 'rocket',
    order: 1,
    subcategories: [
      { id: 'create-account', name: 'Creating an Account', slug: 'create-account' },
      { id: 'first-steps', name: 'First Steps', slug: 'first-steps' },
      { id: 'platform-tour', name: 'Platform Tour', slug: 'platform-tour' },
    ],
  },
  {
    id: 'account',
    name: 'Account & Settings',
    slug: 'account',
    description: 'Manage your account and preferences',
    icon: 'user',
    order: 2,
    subcategories: [
      { id: 'profile', name: 'Profile Management', slug: 'profile' },
      { id: 'security', name: 'Security Settings', slug: 'security' },
      { id: 'notifications', name: 'Notifications', slug: 'notifications' },
      { id: 'privacy', name: 'Privacy Controls', slug: 'privacy' },
    ],
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions & Billing',
    slug: 'subscriptions',
    description: 'Subscription plans and payment information',
    icon: 'credit-card',
    order: 3,
    subcategories: [
      { id: 'plans', name: 'Subscription Plans', slug: 'plans' },
      { id: 'payment-methods', name: 'Payment Methods', slug: 'payment-methods' },
      { id: 'billing-history', name: 'Billing History', slug: 'billing-history' },
      { id: 'cancellation', name: 'Cancellation & Refunds', slug: 'cancellation' },
    ],
  },
  {
    id: 'creators',
    name: 'For Creators',
    slug: 'creators',
    description: 'Everything creators need to know',
    icon: 'star',
    order: 4,
    subcategories: [
      { id: 'become-creator', name: 'Becoming a Creator', slug: 'become-creator' },
      { id: 'content-creation', name: 'Content Creation', slug: 'content-creation' },
      { id: 'monetization', name: 'Monetization', slug: 'monetization' },
      { id: 'analytics', name: 'Analytics & Insights', slug: 'analytics' },
    ],
  },
  {
    id: 'technical',
    name: 'Technical Support',
    slug: 'technical',
    description: 'Troubleshooting and technical issues',
    icon: 'settings',
    order: 5,
    subcategories: [
      { id: 'browser-support', name: 'Browser Support', slug: 'browser-support' },
      { id: 'mobile-apps', name: 'Mobile Apps', slug: 'mobile-apps' },
      { id: 'video-playback', name: 'Video Playback Issues', slug: 'video-playback' },
      { id: 'upload-issues', name: 'Upload Problems', slug: 'upload-issues' },
    ],
  },
  {
    id: 'trust-safety',
    name: 'Trust & Safety',
    slug: 'trust-safety',
    description: 'Community guidelines and safety',
    icon: 'shield',
    order: 6,
    subcategories: [
      { id: 'community-guidelines', name: 'Community Guidelines', slug: 'community-guidelines' },
      { id: 'reporting', name: 'Reporting Content', slug: 'reporting' },
      { id: 'blocking', name: 'Blocking & Restrictions', slug: 'blocking' },
      { id: 'safety-tips', name: 'Safety Tips', slug: 'safety-tips' },
    ],
  },
];

export const helpArticles: HelpArticle[] = [
  // Getting Started Articles
  {
    id: 'how-to-create-account',
    title: 'How to Create an Account',
    slug: 'how-to-create-account',
    category: 'getting-started',
    subcategory: 'create-account',
    content: `
# How to Create an Account

Welcome to our platform! Creating an account is quick and easy. Follow these steps to get started:

## Step 1: Navigate to Sign Up
Click the "Sign Up" button in the top right corner of any page.

## Step 2: Choose Your Sign Up Method
You can create an account using:
- Email and password
- Google account
- Apple ID

## Step 3: Complete Your Profile
After signing up, you'll be prompted to:
- Choose a username
- Add a profile picture (optional)
- Write a bio (optional)
- Set your preferences

## Step 4: Verify Your Email
Check your email for a verification link and click it to activate your account.

## Tips for Account Security
- Use a strong, unique password
- Enable two-factor authentication
- Keep your email address up to date

## Next Steps
Once your account is created, you can:
- Explore content from creators
- Subscribe to your favorite creators
- Customize your feed preferences
- Start creating your own content
    `,
    keywords: ['create account', 'sign up', 'register', 'new user', 'getting started'],
    lastUpdated: '2024-01-15',
    readTime: 3,
    relatedArticles: ['account-security-basics', 'profile-setup-guide'],
  },
  {
    id: 'platform-overview',
    title: 'Platform Overview: What You Can Do',
    slug: 'platform-overview',
    category: 'getting-started',
    subcategory: 'platform-tour',
    content: `
# Platform Overview: What You Can Do

Our platform connects creators with their audience through exclusive content and direct support.

## For Viewers
- **Discover Content**: Browse trending creators and content
- **Subscribe**: Support creators with monthly subscriptions
- **Interact**: Comment, like, and share content
- **Exclusive Access**: Get access to subscriber-only content

## For Creators
- **Share Content**: Upload videos, photos, and posts
- **Monetize**: Earn from subscriptions and tips
- **Analytics**: Track your growth and engagement
- **Community**: Build relationships with your audience

## Key Features
1. **Personalized Feed**: Content tailored to your interests
2. **Direct Messaging**: Connect with creators (based on tier)
3. **Live Streaming**: Watch live content from creators
4. **Mobile Apps**: Access on iOS and Android
5. **Safe Payments**: Secure subscription management

## Getting Help
- Visit our Help Center for guides and tutorials
- Contact support for personalized assistance
- Join our community forums for tips and discussions
    `,
    keywords: ['overview', 'features', 'what can I do', 'platform guide', 'how it works'],
    lastUpdated: '2024-01-15',
    readTime: 5,
    relatedArticles: ['how-to-create-account', 'subscription-tiers-explained'],
  },
  // Account & Settings Articles
  {
    id: 'account-security-basics',
    title: 'Account Security Best Practices',
    slug: 'account-security-basics',
    category: 'account',
    subcategory: 'security',
    content: `
# Account Security Best Practices

Keeping your account secure is our top priority. Follow these best practices to protect your account.

## Enable Two-Factor Authentication (2FA)
1. Go to Settings > Security
2. Click "Enable 2FA"
3. Choose your preferred method:
   - SMS verification
   - Authenticator app (recommended)
   - Email verification

## Create a Strong Password
Your password should be:
- At least 12 characters long
- Include uppercase and lowercase letters
- Include numbers and special characters
- Unique to this platform
- Not based on personal information

## Recognize Phishing Attempts
We will NEVER ask for:
- Your password via email or DM
- Payment information outside the platform
- Personal identification documents via email

## Regular Security Checkups
Monthly tasks:
- Review active sessions
- Check connected devices
- Update recovery email
- Review recent activity

## What to Do If Compromised
1. Change your password immediately
2. Review recent account activity
3. Remove unrecognized devices
4. Contact support if you notice unauthorized changes

## Additional Security Features
- Login alerts for new devices
- Session management
- IP address tracking
- Security logs
    `,
    keywords: ['security', 'password', '2FA', 'two-factor', 'account safety', 'phishing'],
    lastUpdated: '2024-01-15',
    readTime: 4,
    relatedArticles: ['how-to-change-password', 'suspicious-activity-guide'],
  },
  // Add more articles for each category...
  {
    id: 'subscription-tiers-explained',
    title: 'Understanding Subscription Tiers',
    slug: 'subscription-tiers-explained',
    category: 'subscriptions',
    subcategory: 'plans',
    content: `
# Understanding Subscription Tiers

Our platform offers flexible subscription options to support creators at different levels.

## Platform Subscription
Access to basic features and content discovery:
- Browse all public content
- Limited daily video views
- Basic quality streaming
- Community participation

## Creator Subscriptions
Each creator can offer multiple tiers:

### Tier 1: Supporter ($4.99-9.99/month)
- Access to subscriber-only posts
- Early access to content
- Subscriber badge

### Tier 2: Fan ($9.99-24.99/month)
- Everything in Tier 1
- Exclusive content
- Monthly live streams
- Direct messaging

### Tier 3: VIP ($24.99+/month)
- Everything in Tier 2
- Behind-the-scenes content
- Priority support
- Custom perks

## Managing Subscriptions
- View all subscriptions in Account Settings
- Cancel anytime - access until period ends
- Change tiers instantly
- Pause subscriptions temporarily

## Payment Methods
- Credit/Debit cards
- PayPal
- Apple Pay / Google Pay
- Platform credits
    `,
    keywords: ['subscription', 'tiers', 'pricing', 'plans', 'payment'],
    lastUpdated: '2024-01-15',
    readTime: 3,
    relatedArticles: ['payment-methods', 'cancel-subscription'],
  },
];

// Helper function to search articles
export function searchHelpArticles(query: string): HelpArticle[] {
  const normalizedQuery = query.toLowerCase();
  return helpArticles.filter(article => 
    article.title.toLowerCase().includes(normalizedQuery) ||
    article.content.toLowerCase().includes(normalizedQuery) ||
    article.keywords.some(keyword => keyword.toLowerCase().includes(normalizedQuery))
  );
}

// Helper function to get articles by category
export function getArticlesByCategory(categorySlug: string, subcategorySlug?: string): HelpArticle[] {
  return helpArticles.filter(article => 
    article.category === categorySlug &&
    (!subcategorySlug || article.subcategory === subcategorySlug)
  );
}

// Helper function to get a single article by slug
export function getArticleBySlug(slug: string): HelpArticle | undefined {
  return helpArticles.find(article => article.slug === slug);
}

// Helper function to get related articles
export function getRelatedArticles(articleId: string): HelpArticle[] {
  const article = helpArticles.find(a => a.id === articleId);
  if (!article || !article.relatedArticles) return [];
  
  return article.relatedArticles
    .map(id => helpArticles.find(a => a.id === id))
    .filter(Boolean) as HelpArticle[];
}