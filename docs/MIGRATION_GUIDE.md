# Implementation Guide: Migrating to the Design System

This guide will help you migrate existing components from arbitrary Tailwind values to our new semantic design system.

## Quick Reference

### Common Replacements

| Old (Arbitrary Values) | New (Semantic Classes) | Description |
|----------------------|----------------------|-------------|
| `min-w-[140px]` | `min-w-36` | Minimum width |
| `w-[200px]` | `w-50` | Fixed width |
| `h-[60px]` | `h-15` | Fixed height |
| `px-6 py-3` | `btn-primary` | Button styling |
| `text-pink-400` | `text-void-accent` | Brand accent color |
| `bg-pink-50` | `bg-background-secondary` | Light background |
| `rounded-lg` | `rounded-card` | Card border radius |
| `shadow-lg` | `shadow-elevated` | Elevated shadow |

### Component Class Patterns

```tsx
// ❌ Old way with arbitrary values
<button className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
  Click me
</button>

// ✅ New way with semantic classes
<button className="btn-primary">
  Click me
</button>

// ❌ Old way with mixed arbitrary values
<div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
  Content
</div>

// ✅ New way with card component
<div className="card">
  Content
</div>
```

## Migration Checklist

### 1. Button Components
- [ ] Replace `px-*` and `py-*` padding with `btn-*` classes
- [ ] Replace color combinations with semantic button classes
- [ ] Use size variants: `btn-*-sm` for small buttons
- [ ] Apply state classes: `btn-*:disabled` for disabled states

### 2. Card Components
- [ ] Replace `bg-white rounded-* shadow-* p-*` with `card`
- [ ] Use `card-hover` for interactive cards
- [ ] Use `card-glass` for glassmorphism effects
- [ ] Apply `card-border` for bordered cards

### 3. Form Elements
- [ ] Replace input styling with `form-input`
- [ ] Use `form-input-error` and `form-input-success` for states
- [ ] Replace label styling with `form-label`
- [ ] Use `form-help` and `form-error` for helper text

### 4. Typography
- [ ] Replace `text-*` color classes with semantic text colors
- [ ] Use `text-display`, `text-body` for consistent typography
- [ ] Apply `text-gradient` for brand gradient text
- [ ] Use `line-clamp-*` for text truncation

### 5. Spacing and Layout
- [ ] Replace arbitrary width/height values with spacing scale
- [ ] Use `container-*` classes for consistent containers
- [ ] Apply `space-content` for content spacing
- [ ] Use `gap-*` values from the spacing scale

## Component Examples

### Before and After: Creator Card

```tsx
// ❌ Before (with arbitrary values)
const CreatorCard = ({ creator }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
    <div className="flex items-center mb-4">
      <img 
        src={creator.avatar} 
        className="w-12 h-12 rounded-full mr-3"
        alt={creator.name}
      />
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{creator.name}</h3>
        <p className="text-gray-600 text-sm">{creator.category}</p>
      </div>
    </div>
    <div className="flex gap-2 mb-4">
      {creator.tags.map(tag => (
        <span 
          key={tag}
          className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs"
        >
          {tag}
        </span>
      ))}
    </div>
    <button className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
      Follow
    </button>
  </div>
);

// ✅ After (with design system)
const CreatorCard = ({ creator }) => (
  <div className="creator-card">
    <div className="flex items-center mb-4">
      <img 
        src={creator.avatar} 
        className="w-12 h-12 rounded-full mr-3"
        alt={creator.name}
      />
      <div>
        <h3 className="text-lg font-semibold text-text-primary">{creator.name}</h3>
        <p className="text-text-tertiary text-sm">{creator.category}</p>
      </div>
    </div>
    <div className="flex gap-2 mb-4">
      {creator.tags.map(tag => (
        <span key={tag} className="category-tag">
          {tag}
        </span>
      ))}
    </div>
    <button className="btn-primary w-full">
      Follow
    </button>
  </div>
);
```

### Before and After: Form Component

```tsx
// ❌ Before (with arbitrary values)
const LoginForm = () => (
  <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign In</h2>
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input 
          type="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          placeholder="Enter your email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input 
          type="password"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          placeholder="Enter your password"
        />
      </div>
      <button 
        type="submit"
        className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors"
      >
        Sign In
      </button>
    </form>
  </div>
);

// ✅ After (with design system)
const LoginForm = () => (
  <div className="card max-w-md w-full">
    <h2 className="text-display text-center mb-6">Sign In</h2>
    <form className="space-y-4">
      <div>
        <label className="form-label">Email</label>
        <input 
          type="email"
          className="form-input"
          placeholder="Enter your email"
        />
      </div>
      <div>
        <label className="form-label">Password</label>
        <input 
          type="password"
          className="form-input"
          placeholder="Enter your password"
        />
      </div>
      <button type="submit" className="btn-primary w-full">
        Sign In
      </button>
    </form>
  </div>
);
```

## Color Migration Guide

### Brand Colors
```tsx
// ❌ Old arbitrary colors
text-pink-500     → text-void-primary
text-pink-400     → text-void-accent  
text-pink-300     → text-void-light
bg-pink-500       → bg-void-primary
bg-pink-50        → bg-background-secondary

// ❌ Old gray colors
text-gray-900     → text-text-primary
text-gray-600     → text-text-secondary
text-gray-400     → text-text-tertiary
bg-gray-100       → bg-background-secondary
bg-gray-50        → bg-background-tertiary
```

### State Colors
```tsx
// Success states
text-green-600    → text-success
bg-green-100      → bg-success/10

// Warning states  
text-yellow-600   → text-warning
bg-yellow-100     → bg-warning/10

// Error states
text-red-600      → text-error
bg-red-100        → bg-error/10
```

## Spacing Migration Guide

### Common Spacing Patterns
```tsx
// Padding and margins
p-6               → p-6 (stays the same, uses spacing scale)
px-4 py-2         → Use btn-* classes instead
m-4               → m-4 (uses spacing scale)

// Widths and heights
w-[200px]         → w-50
min-w-[140px]     → min-w-36
h-[60px]          → h-15
max-w-[400px]     → max-w-sm

// Gaps
gap-[12px]        → gap-3
space-y-[16px]    → space-y-4
```

## Performance Benefits

By using semantic classes instead of arbitrary values:

1. **Reduced bundle size**: Tailwind can better purge unused styles
2. **Better caching**: Semantic classes are more likely to be reused
3. **Improved maintainability**: Consistent design tokens across the app
4. **Better IDE support**: Autocomplete works better with predefined classes

## Testing Your Migration

After migrating components:

1. **Visual regression testing**: Compare before/after screenshots
2. **Accessibility testing**: Ensure color contrast ratios are maintained  
3. **Responsive testing**: Check all breakpoints still work
4. **Interactive testing**: Verify hover/focus states work correctly

## Common Pitfalls

1. **Don't mix arbitrary and semantic**: Choose one approach per component
2. **Maintain spacing consistency**: Use the spacing scale values
3. **Check color contrast**: Ensure accessibility compliance
4. **Test on mobile**: Responsive behavior should remain consistent
5. **Update TypeScript types**: If using typed props, update color/size types

## Next Steps

1. Migrate high-priority components first (buttons, cards, forms)
2. Update component library documentation
3. Create component stories in Storybook (if using)
4. Train team members on new design system
5. Set up linting rules to prevent arbitrary value usage

## Resources

- [Design System Documentation](./DESIGN_SYSTEM.md)
- [Tailwind Configuration](../tailwind.config.js)
- [Component Classes](../src/index.css)
- [Example Component](../src/components/DesignSystemExample.tsx)
