import {
  Compass,
  Grid3x3,
  Users,
  Home,
  Settings,
  CreditCard,
  Bell,
  HelpCircle,
  MessageSquare,
  Shield,
  User,
  BarChart3,
  PlusCircle,
  Heart,
  type LucideIcon
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: NavItem[];
  requiredAuth?: boolean;
  requiredRole?: UserRole[];
}

export type UserRole = 'viewer' | 'creator' | 'admin';

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
  collapsible?: boolean;
  requiredAuth?: boolean;
  requiredRole?: UserRole[];
}

export const navigationConfig: NavSection[] = [
  {
    id: 'media',
    title: 'Media',
    requiredAuth: false,
    items: [
      {
        id: 'explore',
        label: 'Explore',
        icon: Compass,
        path: '/'
      },
      {
        id: 'categories',
        label: 'Categories',
        icon: Grid3x3,
        path: '/categories'
      },
      {
        id: 'creators',
        label: 'Creators',
        icon: Users,
        path: '/creators'
      }
    ]
  },
  {
    id: 'account',
    title: 'Account',
    requiredAuth: true,
    items: [
      {
        id: 'my-feed',
        label: 'My Feed',
        icon: Home,
        path: '/my-feed',
        requiredAuth: true
      },
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: BarChart3,
        path: '/dashboard',
        requiredAuth: true
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        path: '/notifications',
        requiredAuth: true
      },
      {
        id: 'favorites',
        label: 'Favorites',
        icon: Heart,
        path: '/favorites',
        requiredAuth: true
      },
      {
        id: 'account-settings',
        label: 'Settings',
        icon: Settings,
        path: '/account-settings',
        requiredAuth: true,
        children: [
          {
            id: 'profile',
            label: 'Profile',
            icon: User,
            path: '/account-settings'
          },
          {
            id: 'security',
            label: 'Security',
            icon: Shield,
            path: '/security'
          },
          {
            id: 'billing',
            label: 'Billing',
            icon: CreditCard,
            path: '/billing'
          }
        ]
      }
    ]
  },
  {
    id: 'creator',
    title: 'Creator Tools',
    requiredAuth: true,
    requiredRole: ['creator'],
    items: [
      {
        id: 'creator-dashboard',
        label: 'Creator Dashboard',
        icon: BarChart3,
        path: '/creator-dashboard',
        requiredAuth: true,
        requiredRole: ['creator']
      },
      {
        id: 'upload-content',
        label: 'Upload Content',
        icon: PlusCircle,
        path: '/creator-dashboard/upload',
        requiredAuth: true,
        requiredRole: ['creator']
      }
    ]
  },
  {
    id: 'support',
    title: 'Support',
    requiredAuth: false,
    items: [
      {
        id: 'help',
        label: 'Help Center',
        icon: HelpCircle,
        path: '/help'
      },
      {
        id: 'contact',
        label: 'Contact Us',
        icon: MessageSquare,
        path: '/contact'
      }
    ]
  }
];

// Helper function to flatten navigation for search/quick access
export const flattenNavigation = (sections: NavSection[]): NavItem[] => {
  const items: NavItem[] = [];
  
  sections.forEach(section => {
    section.items.forEach(item => {
      items.push(item);
      if (item.children) {
        items.push(...item.children);
      }
    });
  });
  
  return items;
};

// Helper function to find active item by path
export const findActiveItem = (sections: NavSection[], path: string): NavItem | null => {
  for (const section of sections) {
    for (const item of section.items) {
      if (item.path === path) {
        return item;
      }
      if (item.children) {
        const child = item.children.find(c => c.path === path);
        if (child) return child;
      }
    }
  }
  return null;
};