# Tailwind CSS Design System Documentation

## Overview

This document outlines the consistent design system for the premium media subscription platform. The system provides semantic utilities and component classes to ensure consistent styling across the application while avoiding arbitrary values.

## Design Principles

1. **Semantic over Arbitrary**: Use semantic class names instead of arbitrary values
2. **Component-Based**: Utilize pre-defined component classes for consistency
3. **Token-Based Colors**: All colors are defined in the theme configuration
4. **Responsive Design**: Mobile-first approach with consistent breakpoints
5. **Accessibility**: Focus states, contrast ratios, and semantic HTML

## Color System

### Brand Colors

```css
/* Primary Brand Palette */
abyss-black: #000000
abyss-dark-gray: #333333
abyss-light-gray: #cccccc

/* Void Theme Colors */
void-50 to void-950: Purple spectrum
void-accent: #a855f7 (with light/dark variants)
seductive: #ec4899 (with light/dark variants)
lust-violet: #4B0082
```

### Semantic Colors

```css
/* Text Colors */
text-primary: #ffffff          /* Primary text on dark backgrounds */
text-secondary: #e5e7eb        /* Secondary text */
text-tertiary: #9ca3af         /* Tertiary text */
text-muted: #6b7280           /* Muted text */
text-disabled: #4b5563        /* Disabled text */

/* Background Colors */
background-primary: #000000    /* Main background */
background-secondary: #1a1a2e  /* Secondary background */
background-tertiary: #16213e   /* Tertiary background */
background-card: #2a1a3e      /* Card backgrounds */
background-glass: rgba(26, 26, 46, 0.8) /* Glass effect */

/* Border Colors */
border-primary: rgba(168, 85, 247, 0.3)  /* Primary borders */
border-secondary: rgba(192, 132, 252, 0.2) /* Secondary borders */
border-muted: rgba(107, 114, 128, 0.2)   /* Muted borders */
```

### State Colors

```css
success: #22c55e
warning: #f59e0b
error: #ef4444
info: #3b82f6
```

## Typography

### Font Families

```css
font-display: "Cormorant Garamond" /* For headings and display text */
font-body: "Lato"                  /* For body text */
font-sans: "Lato"                  /* Default sans-serif */
font-serif: "Cormorant Garamond"   /* Serif font */
```

### Font Sizes

```css
/* Standard Sizes */
text-xs to text-9xl

/* Display Sizes (for marketing/hero content) */
text-display-xs: 1.5rem
text-display-sm: 1.875rem
text-display-md: 2.25rem
text-display-lg: 3rem
text-display-xl: 3.75rem
text-display-2xl: 4.5rem
```

## Component Classes

### Buttons

#### Primary Buttons
```html
<!-- Standard primary button -->
<button class="btn-primary">Primary Action</button>

<!-- Small primary button -->
<button class="btn-primary-sm">Small Action</button>
```

#### Secondary Buttons
```html
<!-- Standard secondary button -->
<button class="btn-secondary">Secondary Action</button>

<!-- Small secondary button -->
<button class="btn-secondary-sm">Small Secondary</button>
```

#### Specialized Buttons
```html
<!-- Outline button -->
<button class="btn-outline">Outline Button</button>

<!-- Ghost button -->
<button class="btn-ghost">Ghost Button</button>

<!-- Danger button -->
<button class="btn-danger">Delete Account</button>

<!-- Success button -->
<button class="btn-success">Confirm</button>
```

### Cards

```html
<!-- Standard card -->
<div class="card">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>

<!-- Hoverable card -->
<div class="card-hover">
  <h3>Interactive Card</h3>
</div>

<!-- Glass effect card -->
<div class="card-glass">
  <h3>Glass Card</h3>
</div>

<!-- Elevated card -->
<div class="card-elevated">
  <h3>Elevated Card</h3>
</div>
```

### Forms

#### Input Fields
```html
<!-- Standard input -->
<input class="form-input" type="text" placeholder="Enter text">

<!-- Input with error state -->
<input class="form-input-error" type="text" placeholder="Enter text">

<!-- Input with success state -->
<input class="form-input-success" type="text" placeholder="Enter text">

<!-- Textarea -->
<textarea class="form-textarea" placeholder="Enter description"></textarea>

<!-- Select dropdown -->
<select class="form-select">
  <option>Choose option</option>
</select>
```

#### Labels and Help Text
```html
<!-- Standard label -->
<label class="form-label">Email Address</label>

<!-- Required field label -->
<label class="form-label-required">Password</label>

<!-- Help text -->
<p class="form-help">Your email will not be shared</p>

<!-- Error message -->
<p class="form-error">This field is required</p>

<!-- Success message -->
<p class="form-success">Email is available</p>
```

### Navigation

```html
<!-- Standard navigation link -->
<a class="nav-link" href="/profile">Profile</a>

<!-- Active navigation link -->
<a class="nav-link-active" href="/dashboard">Dashboard</a>

<!-- Navigation link with underline effect -->
<a class="nav-link nav-link-underline" href="/explore">Explore</a>

<!-- Mobile navigation link -->
<a class="nav-mobile-link" href="/settings">Settings</a>
```

### Status Indicators

```html
<!-- Online status -->
<div class="status-online"></div>

<!-- Offline status -->
<div class="status-offline"></div>

<!-- Away status -->
<div class="status-away"></div>

<!-- Busy status -->
<div class="status-busy"></div>
```

### Badges

```html
<!-- Primary badge -->
<span class="badge-primary">New</span>

<!-- Success badge -->
<span class="badge-success">Verified</span>

<!-- Warning badge -->
<span class="badge-warning">Pending</span>

<!-- Error badge -->
<span class="badge-error">Failed</span>

<!-- Trending badge -->
<span class="badge-trending">Trending</span>
```

### Category Tags

```html
<!-- Standard category tag -->
<span class="category-tag">Lifestyle</span>

<!-- Selected category tag -->
<span class="category-tag-selected">Fitness</span>

<!-- Small category tag -->
<span class="category-tag-sm">Art</span>
```

### Alerts

```html
<!-- Success alert -->
<div class="alert-success">
  <p>Profile updated successfully!</p>
</div>

<!-- Warning alert -->
<div class="alert-warning">
  <p>Your subscription expires soon.</p>
</div>

<!-- Error alert -->
<div class="alert-error">
  <p>Unable to process payment.</p>
</div>

<!-- Info alert -->
<div class="alert-info">
  <p>New features are available.</p>
</div>
```

## Layout Components

### Containers

```html
<!-- Main app container -->
<div class="container-app">
  <!-- App content -->
</div>

<!-- Content container -->
<div class="container-content">
  <!-- Article content -->
</div>

<!-- Narrow container -->
<div class="container-narrow">
  <!-- Form content -->
</div>

<!-- Wide container -->
<div class="container-wide">
  <!-- Gallery content -->
</div>
```

## Specialized Components

### Media and Creator Cards

```html
<!-- Media item -->
<div class="media-item">
  <!-- Media content -->
</div>

<!-- Creator card -->
<div class="creator-card">
  <!-- Creator content -->
</div>

<!-- Subscription tier card -->
<div class="tier-card">
  <!-- Tier content -->
</div>

<!-- Featured tier card -->
<div class="tier-card-featured">
  <!-- Featured tier content -->
</div>
```

## Text Utilities

### Gradient Text

```html
<!-- Primary gradient text -->
<h1 class="text-gradient">Gradient Heading</h1>

<!-- Accent gradient text -->
<h2 class="text-gradient-accent">Accent Gradient</h2>

<!-- Muted gradient text -->
<h3 class="text-gradient-muted">Muted Gradient</h3>
```

### Font Families

```html
<!-- Display text (for headings) -->
<h1 class="text-display">Display Heading</h1>

<!-- Body text -->
<p class="text-body">Body paragraph text</p>
```

### Line Clamping

```html
<!-- Clamp to 1 line -->
<p class="line-clamp-1">This text will be truncated to one line...</p>

<!-- Clamp to 2 lines -->
<p class="line-clamp-2">This text will be truncated to two lines...</p>

<!-- Clamp to 3 lines -->
<p class="line-clamp-3">This text will be truncated to three lines...</p>
```

## Effects and Animations

### Glass Effects

```html
<!-- Standard glass effect -->
<div class="glass">
  <!-- Content -->
</div>

<!-- Strong glass effect -->
<div class="glass-strong">
  <!-- Content -->
</div>
```

### Loading States

```html
<!-- Pulse loading -->
<div class="loading-pulse h-4 w-32 rounded"></div>

<!-- Shimmer loading -->
<div class="loading-shimmer h-4 w-32 rounded bg-gray-700"></div>
```

### Animations

```html
<!-- Float animation -->
<div class="float-animation">
  <!-- Floating element -->
</div>

<!-- Glow animation -->
<div class="glow-animation">
  <!-- Glowing element -->
</div>
```

### Focus States

```html
<!-- Standard focus ring -->
<button class="focus-ring">Focusable Button</button>

<!-- Inset focus ring -->
<input class="focus-ring-inset" type="text">
```

## Scrollbar Styling

```html
<!-- Thin scrollbar -->
<div class="scrollbar-thin overflow-y-auto">
  <!-- Scrollable content -->
</div>
```

## Best Practices

### 1. Always Use Semantic Classes

**❌ Don't:**
```html
<button class="bg-[#a855f7] text-white px-[24px] py-[12px] rounded-[8px]">
  Submit
</button>
```

**✅ Do:**
```html
<button class="btn-primary">
  Submit
</button>
```

### 2. Use Theme Colors

**❌ Don't:**
```html
<div class="text-[#e5e7eb] bg-[#1a1a2e]">
  Content
</div>
```

**✅ Do:**
```html
<div class="text-text-secondary bg-background-secondary">
  Content
</div>
```

### 3. Utilize Component Classes

**❌ Don't:**
```html
<div class="bg-void-dark-900/80 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-void-500/20">
  Card content
</div>
```

**✅ Do:**
```html
<div class="card">
  Card content
</div>
```

### 4. Use Consistent Spacing

**❌ Don't:**
```html
<div class="mb-[18px] mt-[22px] px-[14px]">
  Content
</div>
```

**✅ Do:**
```html
<div class="mb-4 mt-6 px-4">
  Content
</div>
```

### 5. Responsive Design

```html
<!-- Use responsive prefixes -->
<div class="container-narrow md:container-content lg:container-app">
  <!-- Responsive container -->
</div>

<!-- Responsive text sizes -->
<h1 class="text-2xl md:text-4xl lg:text-display-lg">
  Responsive Heading
</h1>
```

## Migration Guide

### From Arbitrary Values to Semantic Classes

1. **Identify arbitrary values** in your components
2. **Map to semantic equivalents** using this guide
3. **Replace gradually** to avoid breaking changes
4. **Test thoroughly** across different screen sizes
5. **Document custom patterns** if needed

### Example Migration

**Before:**
```html
<button class="bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white px-6 py-3 rounded-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all duration-200">
  Sign Up
</button>
```

**After:**
```html
<button class="btn-primary">
  Sign Up
</button>
```

## Extending the System

If you need to add new components or variants:

1. **Add to tailwind.config.js** for new tokens
2. **Create component class** in index.css
3. **Document in this guide**
4. **Update existing usage** to maintain consistency

## Testing Checklist

- [ ] No arbitrary values in production code
- [ ] All colors use theme tokens
- [ ] Component classes are used consistently
- [ ] Responsive behavior works correctly
- [ ] Focus states are accessible
- [ ] Dark theme compatibility maintained
