# Brown Theme Essentials for raf.works

## Color Palette

### Light Mode
```css
:root {
  --bg-primary: #f9f6f2;      /* Warm cream background */
  --bg-secondary: #ede7e0;    /* Light taupe sidebar */
  --text-primary: #2c1810;    /* Dark espresso text */
  --text-secondary: #5d4037;  /* Medium brown secondary */
  --accent-primary: #d4a574;  /* Caramel links/buttons */
  --accent-hover: #8d5524;    /* Chocolate hover */
  --border: #c8b299;          /* Light brown borders */
}
```

### Dark Mode
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1410;    /* Deep espresso background */
    --bg-secondary: #2d2520;  /* Dark chocolate sidebar */
    --text-primary: #f2e6d9;  /* Warm cream text */
    --text-secondary: #d4c4b0; /* Light taupe secondary */
    --accent-primary: #e6b887; /* Golden caramel */
    --accent-hover: #cc9966;   /* Amber hover */
    --border: #3d2f24;        /* Coffee borders */
  }
}
```

## Key Design Elements

**Layout**: Two-column with colored sidebar (25%) + main content (75%)

**Navigation Colors** (for different sections):
- Work: `#d4a574` (Caramel)
- About: `#a67c52` (Cinnamon) 
- Projects: `#8d5524` (Chocolate)
- Contact: `#b8956f` (Toffee)

**Typography**:
- H1: `var(--text-primary)`, 600 weight, 2.5rem
- H2: `var(--text-secondary)`, 500 weight, 1.5rem
- Body: `var(--text-primary)`, 400 weight, 1.6 line-height
- Links: `var(--accent-primary)` with `var(--accent-hover)` on hover

**Components**:
- Cards: `var(--bg-primary)` background, `var(--border)` border
- Buttons: `var(--accent-primary)` background, hover to `var(--accent-hover)`
- Sidebar: `var(--bg-secondary)` background

This creates a refined brown aesthetic inspired by chrsl.net's organization while maintaining warmth and professionalism.
