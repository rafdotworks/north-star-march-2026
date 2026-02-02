/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Golden Ratio Typography Scale (φ ≈ 1.618, 14px anchor)
      // Overrides Tailwind defaults to ensure consistency across codebase
      // Maps directly to CSS variables in globals.css (--text-*)
      fontSize: {
        '2xs': '10px',  // --text-2xs: labels, timestamps, uppercase section headers
        'xs': '12px',   // --text-xs: metadata (year, role), captions
        'sm': '14px',   // --text-sm: body text, descriptions, navigation
        'base': '16px', // --text-base: modal content, emphasized body text
        'lg': '20px',   // --text-lg: subheadings
        'xl': '22px',   // --text-xl: page titles, headings, "Raf" name
        '2xl': '26px',  // --text-2xl: hero name (desktop), large display text
      },
      // Measure (Line Length) Constraints for Readability
      // Based on typographic research: 45-75 characters per line optimal
      // See app/config/typographyConfig.ts MEASURE_GUIDELINES for full documentation
      maxWidth: {
        // Character-based measures (preferred for responsive typography)
        'prose-narrow': '45ch',  // 40-50 chars - modals, side panels, constrained spaces
        'prose': '65ch',          // 60-70 chars - optimal for body text, articles
        'prose-wide': '80ch',     // 75-85 chars - technical content, code examples
        
        // Pixel-based alternatives (for specific layout requirements)
        'reading': '680px',       // Matches 65ch at 14px body text
        'article': '720px',       // Slightly wider for articles with mixed content
      },
      fontFamily: {
        sans: ["var(--font-ronzino)"],
        serif: ["var(--font-ronzino)"],
        "edu-marist": ["var(--font-edu-marist)"],
      },
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 1s ease-in-out infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
