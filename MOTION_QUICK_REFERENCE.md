# Motion Design Quick Reference

## 🎨 CSS Animation Classes

### Utility Classes
```css
.fade-in          /* Fade in animation */
.slide-in-up      /* Slide in from bottom */
.scale-in         /* Scale in animation */
.pulse            /* Pulse animation */
.shake            /* Shake animation (for errors) */
.checkmark-pop    /* Checkmark pop animation */
.skeleton         /* Shimmer loading effect */
```

## ⚡ Motion Tokens

### Durations
```css
var(--duration-fast)          /* 120ms */
var(--duration-fast-medium)   /* 150ms */
var(--duration-medium)        /* 200ms */
var(--duration-medium-slow)   /* 250ms */
var(--duration-slow-medium)   /* 300ms */
var(--duration-slow)          /* 350ms */
var(--duration-slower)        /* 400ms */
var(--duration-slowest)       /* 500ms */
```

### Easing Functions
```css
var(--ease-standard)  /* cubic-bezier(0.4, 0, 0.2, 1) */
var(--ease-spring)    /* cubic-bezier(0.2, 0.8, 0.2, 1) */
var(--ease-pop)       /* cubic-bezier(0.34, 1.56, 0.64, 1) */
var(--ease-out)       /* cubic-bezier(0.4, 0, 1, 1) */
var(--ease-in)        /* cubic-bezier(0, 0, 0.2, 1) */
var(--ease-linear)    /* linear */
```

## 🧩 React Components

### PageTransition
```tsx
import { PageTransition } from "@/components/animations";

<PageTransition>
    {children}
</PageTransition>
```

### AnimatedDropdown
```tsx
import { AnimatedDropdown } from "@/components/animations";

<AnimatedDropdown isOpen={open} style={{...}}>
    {content}
</AnimatedDropdown>
```

### SkeletonLoader
```tsx
import { SkeletonLoader } from "@/components/animations";

<SkeletonLoader width="100%" height={60} />
<SkeletonLoader height={20} count={5} />
<SkeletonLoader rounded />
```

### Toast Notifications
```tsx
import { useToast } from "@/components/ToastProvider";

const { showToast } = useToast();

// Types: "success" | "error" | "warning" | "info"
showToast("Message here", "success");
```

### AnimatedFormField
```tsx
import { AnimatedFormField } from "@/components/animations";

<AnimatedFormField
    label="Email"
    error={errors.email}
    success={isValid}
    required
>
    <input type="email" />
</AnimatedFormField>
```

### StaggerContainer
```tsx
import { StaggerContainer, StaggerItem } from "@/components/animations";

<StaggerContainer staggerDelay={0.1}>
    {items.map((item) => (
        <StaggerItem
            key={item.id}
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
            }}
        >
            {item.content}
        </StaggerItem>
    ))}
</StaggerContainer>
```

## 🎯 Common Patterns

### Button with Ripple
```tsx
<button className="btn btn-primary">
    Click Me
</button>
```

### Animated Card
```tsx
<div className="card">
    Card content
</div>
```

### Form Input with Validation
```tsx
<input
    className={errors.field ? "shake" : ""}
    style={{
        borderColor: errors.field ? "var(--danger-border)" : undefined
    }}
/>
```

### Staggered List
```tsx
<StaggerContainer>
    {items.map((item, index) => (
        <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            {item.content}
        </motion.div>
    ))}
</StaggerContainer>
```

## 📐 Animation Guidelines

### When to Use Fast (120-180ms)
- Button hover
- Icon changes
- Micro-feedback
- Badge updates

### When to Use Medium (200-300ms)
- Card hover
- Dropdown open/close
- Input focus
- Component transitions

### When to Use Slow (350-500ms)
- Page transitions
- Large layout shifts
- Sidebar animations
- Complex animations

### Easing Selection
- **Standard**: General purpose transitions
- **Spring**: Interactive elements (buttons, cards)
- **Pop**: Attention-grabbing (success, errors)
- **Out**: Exiting elements
- **In**: Entering elements

## ♿ Accessibility

All animations automatically respect `prefers-reduced-motion`. No additional code needed!

## 🚀 Performance Tips

1. Use CSS animations when possible (GPU-accelerated)
2. Use Framer Motion for complex animations
3. Avoid animating `width` and `height` - use `transform` instead
4. Use `will-change` sparingly
5. Test on low-end devices

---

**Quick Start:** Import components from `@/components/animations` and use CSS classes from `globals.css`





