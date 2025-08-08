# CSS Group Usage Guide

## The Issue with @apply and group

Tailwind CSS doesn't allow the `group` utility to be used with `@apply` because `group` needs to be applied directly to HTML elements for proper CSS generation.

## Fixed CSS Classes

The following classes have been updated to remove `group` from `@apply` directives:

### Navigation Components

```css
/* ❌ Before - group in @apply */
.nav-link {
  @apply text-text-secondary hover:text-seductive transition-all duration-300 font-medium relative group px-3 py-2 rounded-md hover:bg-seductive/10;
}

/* ✅ After - group removed from @apply */
.nav-link {
  @apply text-text-secondary hover:text-seductive transition-all duration-300 font-medium relative px-3 py-2 rounded-md hover:bg-seductive/10;
}
```

## Usage in Components

When using these CSS classes, you need to add the `group` class directly to your HTML elements:

### Navigation Links with Underline Effect

```tsx
// ✅ Correct usage
<a href="#" className="group nav-link nav-link-underline">
  Dashboard
</a>

// The group class enables the group-hover: modifier in nav-link-underline::after
```

### Mobile Navigation Links

```tsx
// ✅ Correct usage  
<a href="#" className="group nav-mobile-link">
  <Mail className="h-5 w-5 mr-3" />
  Messages
</a>
```

## Why This Happens

1. **Tailwind CSS Limitation**: The `@apply` directive cannot include the `group` utility
2. **CSS Generation**: `group` needs to be in HTML for proper CSS selector generation
3. **Child Selectors**: `group-hover:`, `group-focus:` modifiers depend on the parent having `group`

## Solution Pattern

```tsx
// Pattern for group-enabled components
<div className="group [your-component-class]">
  <div className="group-hover:scale-105">
    Content that responds to parent hover
  </div>
</div>
```

## Updated Components

The following components may need the `group` class added directly:

1. **Navigation links with underline effects**
2. **Mobile menu items**
3. **Any components using group-hover: or group-focus: modifiers**

## Migration Checklist

- [ ] Remove `group` from all `@apply` directives in CSS
- [ ] Add `group` class directly to HTML elements that need it
- [ ] Test hover effects still work with group-hover: modifiers
- [ ] Update component documentation with correct usage examples
