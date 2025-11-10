# Style Migration Examples

This document shows how to convert hardcoded styles to use design tokens.

## Example 1: Button Component

### Before (Hardcoded)
```jsx
<button 
  style={{
    background: '#8b5cf6',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(139, 92, 246, 0.3)',
    transition: 'all 0.3s ease'
  }}
>
  Click Me
</button>
```

### After (Using Tokens)

#### Option 1: CSS Variables
```jsx
<button 
  style={{
    background: 'var(--color-purple-500)',
    color: 'var(--color-white)',
    padding: 'var(--spacing-2) var(--spacing-4)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-purple-md)',
    transition: 'all var(--duration-normal) var(--ease-default)'
  }}
>
  Click Me
</button>
```

#### Option 2: Tailwind Classes (Recommended)
```jsx
<button className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300">
  Click Me
</button>
```

#### Option 3: Component Classes
```jsx
<button className="btn-base btn-gradient-purple btn-md">
  Click Me
</button>
```

## Example 2: Card with Gradient Background

### Before
```jsx
<div
  style={{
    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.5) 0%, rgba(31, 41, 55, 0.5) 100%)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '48px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  }}
>
  Content
</div>
```

### After

#### Option 1: CSS Variables
```jsx
<div
  style={{
    background: 'var(--gradient-bg-dark-purple)',
    backdropFilter: 'var(--backdrop-glass)',
    border: 'var(--border-width-1) solid rgba(255, 255, 255, 0.1)',
    borderRadius: 'var(--radius-3xl)',
    padding: 'var(--spacing-12)',
    boxShadow: 'var(--shadow-lg)'
  }}
>
  Content
</div>
```

#### Option 2: Tailwind + Component Classes
```jsx
<div className="card-glass card-xl rounded-3xl">
  Content
</div>
```

## Example 3: Text with Gradient

### Before
```jsx
<h1
  style={{
    background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 50%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  }}
>
  Gradient Title
</h1>
```

### After

#### Option 1: CSS Variable
```jsx
<h1
  style={{
    background: 'var(--text-gradient-purple-blue)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  }}
>
  Gradient Title
</h1>
```

#### Option 2: Utility Class
```jsx
<h1 className="text-gradient-purple-blue">
  Gradient Title
</h1>
```

## Example 4: Form Input

### Before
```jsx
<input
  type="text"
  style={{
    width: '100%',
    padding: '8px 12px',
    fontSize: '16px',
    color: '#1f2937',
    background: '#ffffff',
    border: '1px solid #d6dde5',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease'
  }}
/>
```

### After

#### Option 1: CSS Variables
```jsx
<input
  type="text"
  style={{
    width: '100%',
    padding: 'var(--spacing-2) var(--spacing-3)',
    fontSize: 'var(--font-size-base)',
    color: 'var(--color-text-primary)',
    background: 'var(--color-white)',
    border: 'var(--border-width-1) solid var(--color-border-primary)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all var(--duration-normal) var(--ease-default)'
  }}
/>
```

#### Option 2: Component Class
```jsx
<input type="text" className="input-base input-md" />
```

## Example 5: Animation

### Before
```jsx
<div
  style={{
    animation: 'fadeIn 0.4s ease-out'
  }}
  className="..."
>
  Content
</div>

<style>{`
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>
```

### After
```jsx
<div className="animate-fadeIn">
  Content
</div>
```

## Example 6: Glass Morphism Effect

### Before
```jsx
<div
  style={{
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    padding: '24px'
  }}
>
  Glass effect
</div>
```

### After
```jsx
<div className="glass-effect rounded-2xl p-6">
  Glass effect
</div>
```

## Example 7: Badge/Tag

### Before
```jsx
<span
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '9999px',
    background: '#d9f1e6',
    color: '#1f5046'
  }}
>
  Active
</span>
```

### After
```jsx
<span className="badge badge-success">
  Active
</span>
```

## Example 8: Progress Bar

### Before
```jsx
<div style={{ 
  width: '100%', 
  height: '8px', 
  background: '#e5e7eb', 
  borderRadius: '9999px' 
}}>
  <div style={{ 
    width: '60%', 
    height: '100%', 
    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', 
    borderRadius: '9999px',
    transition: 'width 0.3s ease'
  }} />
</div>
```

### After
```jsx
<div className="progress">
  <div 
    className="progress-bar progress-bar-gradient" 
    style={{width: '60%'}}
  />
</div>
```

## Example 9: Modal Overlay

### Before
```jsx
<div
  style={{
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(12px)',
    zIndex: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px'
  }}
>
  <div
    style={{
      background: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      maxWidth: '90vw',
      maxHeight: '90vh',
      overflow: 'auto'
    }}
  >
    Modal content
  </div>
</div>
```

### After
```jsx
<div className="modal-overlay">
  <div className="modal-content">
    Modal content
  </div>
</div>
```

## Example 10: Alert Message

### Before
```jsx
<div
  style={{
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #fecaca',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    background: '#fef2f2',
    color: '#991b1b'
  }}
>
  <AlertIcon />
  <span>Error message</span>
</div>
```

### After
```jsx
<div className="alert alert-error">
  <AlertIcon />
  <span>Error message</span>
</div>
```

## Common Conversion Patterns

### Colors
| Before | After (Variable) | After (Tailwind) |
|--------|-----------------|------------------|
| `#3c638d` | `var(--color-primary-600)` | `bg-primary-600` |
| `#ffffff` | `var(--color-white)` | `bg-white` |
| `#ef4444` | `var(--color-error-500)` | `bg-error-500` |
| `rgba(139, 92, 246, 0.3)` | `rgba(var(--color-purple-500), 0.3)` | `bg-purple-500/30` |

### Spacing
| Before | After (Variable) | After (Tailwind) |
|--------|-----------------|------------------|
| `4px` | `var(--spacing-1)` | `p-1` / `m-1` |
| `8px` | `var(--spacing-2)` | `p-2` / `m-2` |
| `16px` | `var(--spacing-4)` | `p-4` / `m-4` |
| `24px` | `var(--spacing-6)` | `p-6` / `m-6` |

### Border Radius
| Before | After (Variable) | After (Tailwind) |
|--------|-----------------|------------------|
| `4px` | `var(--radius-base)` | `rounded` |
| `8px` | `var(--radius-lg)` | `rounded-lg` |
| `12px` | `var(--radius-xl)` | `rounded-xl` |
| `9999px` | `var(--radius-full)` | `rounded-full` |

### Shadows
| Before | After (Variable) | After (Tailwind) |
|--------|-----------------|------------------|
| `0 1px 3px rgba(0,0,0,0.1)` | `var(--shadow-sm)` | `shadow-sm` |
| `0 4px 6px rgba(0,0,0,0.1)` | `var(--shadow-md)` | `shadow-md` |
| `0 10px 15px rgba(0,0,0,0.1)` | `var(--shadow-lg)` | `shadow-lg` |

### Durations
| Before | After (Variable) | After (Tailwind) |
|--------|-----------------|------------------|
| `150ms` | `var(--duration-fast)` | `duration-150` |
| `300ms` | `var(--duration-normal)` | `duration-300` |
| `500ms` | `var(--duration-slow)` | `duration-500` |

## Migration Checklist

When converting a component:

- [ ] Replace all color hex codes with CSS variables
- [ ] Replace hardcoded spacing with spacing tokens
- [ ] Replace border-radius values with radius tokens
- [ ] Replace box-shadow values with shadow tokens
- [ ] Replace animation durations with duration tokens
- [ ] Use semantic tokens where available
- [ ] Prefer Tailwind utilities over inline styles
- [ ] Use component classes for complex patterns
- [ ] Test hover and active states
- [ ] Check responsive behavior
- [ ] Verify dark mode (if applicable)
- [ ] Document any custom tokens added

## Tips

1. **Start with utility classes**: They're easier to maintain
2. **Use component classes for patterns**: When you repeat the same combination
3. **Inline styles as last resort**: Use CSS variables if you must
4. **Keep semantic naming**: Use `--color-text-primary` not `--color-gray-900`
5. **Test thoroughly**: Check all states (hover, focus, active, disabled)
6. **Be consistent**: Don't mix approaches in the same component
