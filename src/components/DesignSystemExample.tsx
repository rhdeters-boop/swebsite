import React from 'react';
import { User, Mail, Settings, LogOut } from 'lucide-react';

interface DesignSystemExampleProps {
  userName?: string;
  userEmail?: string;
  isOnline?: boolean;
}

// This component demonstrates the proper use of the design system
const DesignSystemExample: React.FC<DesignSystemExampleProps> = ({
  userName = "John Doe",
  userEmail = "john@example.com",
  isOnline = true
}) => {
  return (
    <div className="container-content py-8">
      {/* Typography Examples */}
      <section className="mb-12">
        <h1 className="text-display text-gradient mb-4">Design System Examples</h1>
        <p className="text-body text-text-secondary mb-8">
          This component demonstrates proper usage of our design system with semantic classes.
        </p>
      </section>

      {/* Button Examples */}
      <section className="mb-12">
        <h2 className="text-display-sm text-text-primary mb-6">Button Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button className="btn-primary">Primary Button</button>
          <button className="btn-secondary">Secondary Button</button>
          <button className="btn-outline">Outline Button</button>
          <button className="btn-ghost">Ghost Button</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button className="btn-success">Success Action</button>
          <button className="btn-warning">Warning Action</button>
          <button className="btn-danger">Danger Action</button>
          <button className="btn-primary" disabled>Disabled Button</button>
        </div>
        <div className="flex flex-wrap gap-4">
          <button className="btn-primary-sm">Small Primary</button>
          <button className="btn-secondary-sm">Small Secondary</button>
          <button className="btn-outline-sm">Small Outline</button>
          <button className="btn-ghost-sm">Small Ghost</button>
        </div>
      </section>

      {/* Card Examples */}
      <section className="mb-12">
        <h2 className="text-display-sm text-text-primary mb-6">Card Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Standard Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Standard Card</h3>
              <div className={isOnline ? "status-online" : "status-offline"}></div>
            </div>
            <p className="text-text-secondary mb-4">
              This is a standard card component with consistent styling.
            </p>
            <div className="flex gap-2">
              <span className="badge-primary">Active</span>
              <span className="badge-success">Verified</span>
            </div>
          </div>

          {/* Hoverable Card */}
          <div className="card-hover">
            <div className="flex items-center mb-4">
              <User className="h-8 w-8 text-void-accent mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{userName}</h3>
                <p className="text-text-tertiary text-sm">{userEmail}</p>
              </div>
            </div>
            <p className="text-text-secondary mb-4">
              This card has hover effects and interactive states.
            </p>
            <button className="btn-secondary-sm w-full">View Profile</button>
          </div>

          {/* Glass Card */}
          <div className="card-glass">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Glass Effect</h3>
            <p className="text-text-secondary mb-4">
              This card uses glassmorphism effects with backdrop blur.
            </p>
            <div className="flex gap-2">
              <span className="category-tag">Design</span>
              <span className="category-tag-selected">System</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form Examples */}
      <section className="mb-12">
        <h2 className="text-display-sm text-text-primary mb-6">Form Components</h2>
        <div className="card max-w-md">
          <form className="space-y-4">
            <div>
              <label className="form-label-required">Full Name</label>
              <input className="form-input" type="text" placeholder="Enter your full name" />
              <p className="form-help">This will be displayed on your profile</p>
            </div>
            
            <div>
              <label className="form-label">Email Address</label>
              <input className="form-input-success" type="email" value={userEmail} readOnly />
              <p className="form-success">Email address verified</p>
            </div>
            
            <div>
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" rows={4} placeholder="Tell us about yourself"></textarea>
            </div>
            
            <div>
              <label className="form-label">Subscription Tier</label>
              <select className="form-select">
                <option>Basic - $9.99/month</option>
                <option>Premium - $19.99/month</option>
                <option>VIP - $39.99/month</option>
              </select>
            </div>
            
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">Save Changes</button>
              <button type="button" className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      </section>

      {/* Navigation Examples */}
      <section className="mb-12">
        <h2 className="text-display-sm text-text-primary mb-6">Navigation Components</h2>
        <div className="card">
          <nav className="flex flex-wrap gap-6 mb-6">
            <a href="#" className="nav-link nav-link-underline">Dashboard</a>
            <a href="#" className="nav-link-active nav-link-underline">Profile</a>
            <a href="#" className="nav-link nav-link-underline">Settings</a>
            <a href="#" className="nav-link nav-link-underline">Billing</a>
          </nav>
          
          <div className="space-y-2">
            <a href="#" className="nav-mobile-link">
              <Mail className="h-5 w-5 mr-3" />
              Messages
            </a>
            <a href="#" className="nav-mobile-link">
              <Settings className="h-5 w-5 mr-3" />
              Account Settings
            </a>
            <a href="#" className="nav-mobile-link">
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </a>
          </div>
        </div>
      </section>

      {/* Alert Examples */}
      <section className="mb-12">
        <h2 className="text-display-sm text-text-primary mb-6">Alert Components</h2>
        <div className="space-y-4">
          <div className="alert-success">
            <p>Your profile has been updated successfully!</p>
          </div>
          <div className="alert-warning">
            <p>Your subscription will expire in 3 days. Please renew to continue access.</p>
          </div>
          <div className="alert-error">
            <p>Failed to process payment. Please check your payment information.</p>
          </div>
          <div className="alert-info">
            <p>New features are now available in your dashboard.</p>
          </div>
        </div>
      </section>

      {/* Text and Typography Examples */}
      <section className="mb-12">
        <h2 className="text-display-sm text-text-primary mb-6">Typography & Text Utilities</h2>
        <div className="space-y-4">
          <div>
            <h1 className="text-gradient text-4xl font-bold mb-2">Gradient Heading</h1>
            <h2 className="text-gradient-accent text-2xl font-semibold mb-2">Accent Gradient</h2>
            <h3 className="text-gradient-muted text-xl font-medium mb-4">Muted Gradient</h3>
          </div>
          
          <div className="space-y-2">
            <p className="text-text-primary">Primary text color for main content</p>
            <p className="text-text-secondary">Secondary text color for supporting content</p>
            <p className="text-text-tertiary">Tertiary text color for captions</p>
            <p className="text-text-muted">Muted text color for less important information</p>
            <p className="text-text-disabled">Disabled text color for inactive elements</p>
          </div>
          
          <div className="card max-w-md">
            <p className="line-clamp-2">
              This is a longer paragraph that will be truncated to exactly two lines when the content
              exceeds the available space. The text will be cut off with an ellipsis to indicate
              there is more content available.
            </p>
          </div>
        </div>
      </section>

      {/* Specialist Components */}
      <section className="mb-12">
        <h2 className="text-display-sm text-text-primary mb-6">Specialized Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Creator Card Example */}
          <div className="creator-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mr-3">
                    <User className="h-6 w-6 text-text-on-dark" />
                  </div>
                  <div>
                    <h3 className="text-text-primary font-semibold">{userName}</h3>
                    <p className="text-text-tertiary text-sm">Content Creator</p>
                  </div>
                </div>
                <div className="status-online"></div>
              </div>
              <div className="flex gap-2 mb-4">
                <span className="category-tag">Lifestyle</span>
                <span className="category-tag">Fitness</span>
                <span className="badge-trending">Trending</span>
              </div>
              <button className="btn-primary-sm w-full">Follow</button>
            </div>
          </div>

          {/* Tier Card Example */}
          <div className="tier-card-featured">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-text-primary mb-2">Premium Tier</h3>
              <div className="text-4xl font-bold text-gradient mb-2">$19.99</div>
              <p className="text-text-secondary">per month</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-text-secondary">
                <span className="text-success mr-2">✓</span>
                Access to all premium content
              </li>
              <li className="flex items-center text-text-secondary">
                <span className="text-success mr-2">✓</span>
                HD video streaming
              </li>
              <li className="flex items-center text-text-secondary">
                <span className="text-success mr-2">✓</span>
                Direct messaging
              </li>
            </ul>
            <button className="btn-primary w-full">Subscribe Now</button>
          </div>
        </div>
      </section>

      {/* Loading States */}
      <section className="mb-12">
        <h2 className="text-display-sm text-text-primary mb-6">Loading States</h2>
        <div className="card">
          <div className="space-y-4">
            <div className="loading-pulse h-4 w-3/4 rounded"></div>
            <div className="loading-pulse h-4 w-1/2 rounded"></div>
            <div className="loading-pulse h-4 w-2/3 rounded"></div>
            <div className="loading-shimmer h-20 w-full rounded bg-background-tertiary"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignSystemExample;
