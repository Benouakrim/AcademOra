# Quick Theme Changes Guide

This guide shows you exactly what to edit to make common theme changes.

## 🎨 Change Color Palette

### Make Everything Blue Instead of Current Colors

**File**: `src/styles/tokens/colors.css`

```css
:root {
  /* Replace primary color (currently blue-gray) with pure blue */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;  /* Main brand color */
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-primary-950: #172554;
}
```

### Change to Green Theme

```css
:root {
  /* Replace with green */
  --color-primary-50: #f0fdf4;
  --color-primary-100: #dcfce7;
  --color-primary-200: #bbf7d0;
  --color-primary-300: #86efac;
  --color-primary-400: #4ade80;
  --color-primary-500: #22c55e;
  --color-primary-600: #16a34a;  /* Main brand color */
  --color-primary-700: #15803d;
  --color-primary-800: #166534;
  --color-primary-900: #14532d;
  --color-primary-950: #052e16;
}
```

### Change to Purple Theme

```css
:root {
  /* Already have purple, just reassign primary */
  --color-primary-50: var(--color-purple-50);
  --color-primary-100: var(--color-purple-100);
  --color-primary-200: var(--color-purple-200);
  --color-primary-300: var(--color-purple-300);
  --color-primary-400: var(--color-purple-400);
  --color-primary-500: var(--color-purple-500);
  --color-primary-600: var(--color-purple-600);
  --color-primary-700: var(--color-purple-700);
  --color-primary-800: var(--color-purple-800);
  --color-primary-900: var(--color-purple-900);
}
```

## 🔵 Make Interface Rounder or Sharper

### Make Everything Rounder (More Rounded Corners)

**File**: `src/styles/tokens/borders.css`

```css
:root {
  /* Increase all radius values by 50% */
  --radius-sm: 0.1875rem;   /* Was 0.125rem */
  --radius-base: 0.375rem;  /* Was 0.25rem */
  --radius-md: 0.5625rem;   /* Was 0.375rem */
  --radius-lg: 0.75rem;     /* Was 0.5rem */
  --radius-xl: 1.125rem;    /* Was 0.75rem */
  --radius-2xl: 1.5rem;     /* Was 1rem */
  --radius-3xl: 2.25rem;    /* Was 1.5rem */
}
```

### Make Everything Sharper (Less Rounded)

```css
:root {
  /* Reduce radius values */
  --radius-sm: 0.0625rem;   /* Was 0.125rem - 1px */
  --radius-base: 0.125rem;  /* Was 0.25rem - 2px */
  --radius-md: 0.1875rem;   /* Was 0.375rem - 3px */
  --radius-lg: 0.25rem;     /* Was 0.5rem - 4px */
  --radius-xl: 0.375rem;    /* Was 0.75rem - 6px */
  --radius-2xl: 0.5rem;     /* Was 1rem - 8px */
  --radius-3xl: 0.75rem;    /* Was 1.5rem - 12px */
}
```

### Make Everything Square (No Rounded Corners)

```css
:root {
  /* Set all to 0 */
  --radius-sm: 0;
  --radius-base: 0;
  --radius-md: 0;
  --radius-lg: 0;
  --radius-xl: 0;
  --radius-2xl: 0;
  --radius-3xl: 0;
}
```

## 📏 Change Spacing (Make UI More Compact or Spacious)

### Make Interface More Spacious

**File**: `src/styles/tokens/spacing.css`

```css
:root {
  /* Increase by 25% */
  --spacing-component-xs: 0.625rem;  /* Was 0.5rem */
  --spacing-component-sm: 0.9375rem; /* Was 0.75rem */
  --spacing-component-md: 1.25rem;   /* Was 1rem */
  --spacing-component-lg: 1.875rem;  /* Was 1.5rem */
  --spacing-component-xl: 2.5rem;    /* Was 2rem */
  --spacing-component-2xl: 3.75rem;  /* Was 3rem */
}
```

### Make Interface More Compact

```css
:root {
  /* Decrease by 25% */
  --spacing-component-xs: 0.375rem;  /* Was 0.5rem */
  --spacing-component-sm: 0.5625rem; /* Was 0.75rem */
  --spacing-component-md: 0.75rem;   /* Was 1rem */
  --spacing-component-lg: 1.125rem;  /* Was 1.5rem */
  --spacing-component-xl: 1.5rem;    /* Was 2rem */
  --spacing-component-2xl: 2.25rem;  /* Was 3rem */
}
```

## 🔤 Change Typography

### Make All Text Larger

**File**: `src/styles/tokens/typography.css`

```css
:root {
  /* Increase by ~12.5% */
  --font-size-xs: 0.84375rem;   /* Was 0.75rem */
  --font-size-sm: 0.98438rem;   /* Was 0.875rem */
  --font-size-base: 1.125rem;   /* Was 1rem - 18px */
  --font-size-lg: 1.26563rem;   /* Was 1.125rem */
  --font-size-xl: 1.40625rem;   /* Was 1.25rem */
  --font-size-2xl: 1.6875rem;   /* Was 1.5rem */
  --font-size-3xl: 2.10938rem;  /* Was 1.875rem */
  --font-size-4xl: 2.53125rem;  /* Was 2.25rem */
}
```

### Make Text More Readable (Increase Line Height)

```css
:root {
  /* Increase line heights */
  --line-height-normal: 1.6;    /* Was 1.5 */
  --line-height-relaxed: 1.75;  /* Was 1.625 */
  --line-height-loose: 2.25;    /* Was 2 */
  
  /* Update body line height */
  --line-height-body: 1.75;     /* Was 1.625 */
}
```

### Change Font Family

```css
:root {
  /* Change to a different font */
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  /* OR */
  --font-family-sans: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
  /* OR */
  --font-family-sans: 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

## 🌑 Change Shadow Depth

### Make Shadows More Subtle

**File**: `src/styles/tokens/shadows.css`

```css
:root {
  /* Reduce opacity in shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.03);           /* Was 0.05 */
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05);        /* Was 0.1 */
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.05);      /* Was 0.1 */
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.05);      /* Was 0.1 */
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.15);    /* Was 0.25 */
}
```

### Make Shadows More Dramatic

```css
:root {
  /* Increase opacity and spread */
  --shadow-sm: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  --shadow-md: 0 6px 12px -1px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 15px 30px -3px rgba(0, 0, 0, 0.25);
  --shadow-xl: 0 30px 50px -5px rgba(0, 0, 0, 0.3);
  --shadow-2xl: 0 40px 80px -12px rgba(0, 0, 0, 0.4);
}
```

## ⚡ Change Animation Speed

### Make Everything Faster

**File**: `src/styles/tokens/animations.css`

```css
:root {
  /* Reduce durations by 50% */
  --duration-75: 37.5ms;   /* Was 75ms */
  --duration-100: 50ms;    /* Was 100ms */
  --duration-150: 75ms;    /* Was 150ms */
  --duration-200: 100ms;   /* Was 200ms */
  --duration-300: 150ms;   /* Was 300ms */
  --duration-400: 200ms;   /* Was 400ms */
  --duration-500: 250ms;   /* Was 500ms */
  
  /* Update semantic durations */
  --duration-fast: 75ms;     /* Was 150ms */
  --duration-normal: 150ms;  /* Was 300ms */
  --duration-slow: 250ms;    /* Was 500ms */
}
```

### Make Everything Slower (More Graceful)

```css
:root {
  /* Increase durations by 50% */
  --duration-fast: 225ms;     /* Was 150ms */
  --duration-normal: 450ms;   /* Was 300ms */
  --duration-slow: 750ms;     /* Was 500ms */
}
```

## 🎨 Change Gradient Colors

### Use Cooler Gradients (Blues/Purples)

**File**: `src/styles/tokens/gradients.css`

```css
:root {
  /* Replace warm gradients with cool ones */
  --gradient-primary: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  --text-gradient-rainbow: linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #c084fc 100%);
}
```

### Use Warmer Gradients (Oranges/Reds)

```css
:root {
  /* Replace with warm gradients */
  --gradient-primary: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
  --text-gradient-rainbow: linear-gradient(90deg, #fb923c 0%, #f87171 50%, #fbbf24 100%);
}
```

## 🎯 Complete Theme Presets

### Professional Blue Theme
```css
/* colors.css */
:root {
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
}

/* borders.css */
:root {
  --radius-lg: 0.375rem;   /* Subtle rounding */
  --radius-xl: 0.5rem;
  --radius-2xl: 0.75rem;
}

/* shadows.css */
:root {
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.08);  /* Subtle */
}
```

### Modern Purple/Pink Theme
```css
/* colors.css */
:root {
  --color-primary-600: #a855f7;
  --color-primary-700: #9333ea;
}

/* borders.css */
:root {
  --radius-lg: 0.75rem;    /* More rounded */
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
}

/* gradients.css */
:root {
  --gradient-primary: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
}
```

### Minimalist Theme
```css
/* colors.css */
:root {
  --color-primary-600: #18181b;  /* Almost black */
  --color-primary-700: #09090b;
}

/* borders.css */
:root {
  --radius-lg: 0.25rem;    /* Sharp corners */
  --radius-xl: 0.25rem;
  --radius-2xl: 0.375rem;
}

/* shadows.css */
:root {
  --shadow-md: 0 1px 3px 0 rgba(0, 0, 0, 0.1);  /* Very subtle */
  --shadow-lg: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* spacing.css */
:root {
  --spacing-component-md: 0.875rem;  /* More compact */
  --spacing-component-lg: 1.25rem;
}
```

### Vibrant/Playful Theme
```css
/* colors.css */
:root {
  --color-primary-600: #f59e0b;  /* Orange */
  --color-primary-700: #d97706;
}

/* borders.css */
:root {
  --radius-lg: 1rem;       /* Very rounded */
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;
}

/* shadows.css */
:root {
  --shadow-md: 0 8px 16px -1px rgba(0, 0, 0, 0.15);  /* Dramatic */
  --shadow-lg: 0 20px 30px -3px rgba(0, 0, 0, 0.2);
}
```

## 📝 Testing Your Changes

After making changes:

1. **Save the file** - Changes should apply immediately
2. **Refresh your browser** (Ctrl+Shift+R / Cmd+Shift+R)
3. **Check multiple pages** - Ensure consistency
4. **Test interactions** - Hover, click, focus states
5. **Check responsive** - Test on different screen sizes

## 🔄 Reverting Changes

If you don't like the changes:

1. Use Git to see what changed: `git diff src/styles/tokens/colors.css`
2. Revert: `git checkout src/styles/tokens/colors.css`
3. Or manually copy the original values from this guide

## 💡 Pro Tips

1. **Start small** - Change one thing at a time
2. **Keep backups** - Copy files before major changes
3. **Use variables** - Don't go back to hardcoded values
4. **Test thoroughly** - Check all pages and states
5. **Document changes** - Note what you changed and why
6. **Be consistent** - If you change one color, consider related colors
7. **Consider contrast** - Ensure text is readable
8. **Test accessibility** - Use browser tools to check

## 🎯 Common Combinations

### Corporate/Professional Look
- Blue primary color
- Subtle shadows
- Moderate spacing
- Slight border radius

### Startup/Modern Look
- Purple or gradient primary
- Dramatic shadows
- Generous spacing
- Rounded borders

### Minimalist Look
- Black or dark gray primary
- Minimal shadows
- Compact spacing
- Sharp corners

### Friendly/Approachable Look
- Green or orange primary
- Medium shadows
- Generous spacing
- Rounded borders

---

**Remember**: All changes are reversible. Don't be afraid to experiment!
