# Design System Quick Reference

## 🎨 Color Tokens

### Primary & Brand Colors
```css
var(--color-primary-600)    /* Main brand color */
var(--color-accent-500)     /* Secondary brand */
var(--color-neutral-500)    /* Gray/neutral */
```

### Semantic Colors
```css
var(--color-success-600)    /* Green - success */
var(--color-error-600)      /* Red - errors */
var(--color-warning-500)    /* Orange - warnings */
var(--color-info-600)       /* Blue - information */
```

### Gradient Colors
```css
var(--color-purple-500)
var(--color-pink-500)
var(--color-blue-500)
var(--color-green-500)
```

### Background & Text
```css
var(--color-bg-primary)     /* Page background */
var(--color-bg-secondary)   /* Card/component bg */
var(--color-text-primary)   /* Main text */
var(--color-text-secondary) /* Muted text */
```

## 📏 Spacing Tokens

```css
var(--spacing-1)   /* 4px */
var(--spacing-2)   /* 8px */
var(--spacing-3)   /* 12px */
var(--spacing-4)   /* 16px */
var(--spacing-6)   /* 24px */
var(--spacing-8)   /* 32px */
var(--spacing-12)  /* 48px */
```

### Semantic Spacing
```css
var(--spacing-component-md)  /* Component padding */
var(--spacing-section-md)    /* Section spacing */
var(--spacing-gap-md)        /* Grid/flex gaps */
```

## 🔤 Typography Tokens

### Font Families
```css
var(--font-primary)    /* Main font */
var(--font-code)       /* Code/monospace */
```

### Font Sizes
```css
var(--font-size-sm)    /* 14px */
var(--font-size-base)  /* 16px */
var(--font-size-lg)    /* 18px */
var(--font-size-xl)    /* 20px */
var(--font-size-2xl)   /* 24px */
```

### Font Weights
```css
var(--font-weight-normal)    /* 400 */
var(--font-weight-medium)    /* 500 */
var(--font-weight-semibold)  /* 600 */
var(--font-weight-bold)      /* 700 */
```

## 🔵 Border & Radius Tokens

```css
var(--radius-base)   /* 4px */
var(--radius-lg)     /* 8px */
var(--radius-xl)     /* 12px */
var(--radius-2xl)    /* 16px */
var(--radius-3xl)    /* 24px */
var(--radius-full)   /* Circle */
```

### Semantic Radius
```css
var(--radius-button)  /* Button corners */
var(--radius-card)    /* Card corners */
var(--radius-input)   /* Input corners */
```

## 🌑 Shadow Tokens

```css
var(--shadow-sm)   /* Small shadow */
var(--shadow-md)   /* Medium shadow */
var(--shadow-lg)   /* Large shadow */
var(--shadow-xl)   /* Extra large */
var(--shadow-2xl)  /* 2X large */
```

### Colored Shadows
```css
var(--shadow-primary-lg)
var(--shadow-purple-xl)
var(--shadow-success-md)
```

## ⚡ Animation Tokens

### Durations
```css
var(--duration-fast)     /* 150ms */
var(--duration-normal)   /* 300ms */
var(--duration-slow)     /* 500ms */
```

### Easing
```css
var(--ease-default)   /* Smooth easing */
var(--ease-in)        /* Ease in */
var(--ease-out)       /* Ease out */
```

## 🎭 Gradient Tokens

```css
var(--gradient-primary)        /* Primary gradient */
var(--gradient-purple-pink)    /* Purple to pink */
var(--gradient-green)          /* Green gradient */
var(--text-gradient-rainbow)   /* Rainbow text */
```

## 🔧 Effect Tokens

```css
var(--opacity-50)         /* 50% opacity */
var(--blur-md)            /* Medium blur */
var(--backdrop-glass)     /* Glass effect */
var(--z-modal)            /* Modal z-index */
```

## 🎯 Common Component Classes

### Buttons
```html
<button class="btn-base btn-primary btn-md">Button</button>
<button class="btn-base btn-secondary">Secondary</button>
<button class="btn-base btn-gradient-purple">Gradient</button>
```

### Cards
```html
<div class="card">Card content</div>
<div class="card card-glass">Glass card</div>
<div class="card card-elevated">Elevated card</div>
```

### Inputs
```html
<input class="input-base input-md" type="text">
<input class="input-base input-error" type="text">
<select class="input-base select">...</select>
```

### Badges
```html
<span class="badge badge-primary">New</span>
<span class="badge badge-success">Active</span>
```

### Alerts
```html
<div class="alert alert-success">Success!</div>
<div class="alert alert-error">Error!</div>
```

## 🚀 Quick Usage Examples

### Button with Token
```css
.my-button {
  background: var(--color-primary-600);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-normal);
}
```

### Card Component
```css
.my-card {
  background: var(--color-bg-secondary);
  padding: var(--spacing-component-lg);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}
```

### Gradient Text
```css
.gradient-heading {
  background: var(--text-gradient-purple-pink);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Glass Effect
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--backdrop-glass);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

## 📱 Tailwind Utilities

### Colors
```html
<div class="bg-primary-600 text-white">...</div>
<div class="bg-success-100 text-success-800">...</div>
```

### Spacing
```html
<div class="p-4 m-2 gap-3">...</div>
<div class="px-6 py-3">...</div>
```

### Border Radius
```html
<div class="rounded-lg">...</div>
<div class="rounded-full">...</div>
```

### Shadows
```html
<div class="shadow-md hover:shadow-lg">...</div>
```

### Animations
```html
<div class="transition-all duration-300">...</div>
<div class="animate-fadeIn">...</div>
```

## 🎨 Changing Theme Colors

### Update Primary Color
Edit `src/styles/tokens/colors.css`:
```css
:root {
  --color-primary-600: #YOUR_COLOR;
  --color-primary-700: #DARKER_SHADE;
}
```

### Update Spacing Scale
Edit `src/styles/tokens/spacing.css`:
```css
:root {
  --spacing-4: 1.5rem;  /* Change from 1rem */
}
```

### Update Border Radius
Edit `src/styles/tokens/borders.css`:
```css
:root {
  --radius-lg: 12px;  /* Change from 8px */
}
```

## 📋 File Locations

| Token Type | File Path |
|------------|-----------|
| Colors | `src/styles/tokens/colors.css` |
| Spacing | `src/styles/tokens/spacing.css` |
| Typography | `src/styles/tokens/typography.css` |
| Borders | `src/styles/tokens/borders.css` |
| Shadows | `src/styles/tokens/shadows.css` |
| Animations | `src/styles/tokens/animations.css` |
| Effects | `src/styles/tokens/effects.css` |
| Gradients | `src/styles/tokens/gradients.css` |
| Buttons | `src/styles/components/buttons.css` |
| Cards | `src/styles/components/cards.css` |
| Forms | `src/styles/components/forms.css` |
| Utilities | `src/styles/components/utilities.css` |

## 💡 Pro Tips

1. **Always use tokens** instead of hardcoded values
2. **Prefer Tailwind utilities** for simple styling
3. **Use semantic tokens** (e.g., `--color-text-primary` instead of `--color-gray-900`)
4. **Test theme changes** by modifying one token file
5. **Document custom tokens** if you add new ones
6. **Keep it consistent** - don't mix hardcoded and token values

---

For complete documentation, see `docs/DESIGN_SYSTEM_GUIDE.md`
