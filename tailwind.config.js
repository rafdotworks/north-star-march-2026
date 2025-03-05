/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-ronzino)"],
        serif: ["var(--font-ronzino)"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: "var(--font-ronzino)",
            color: "hsl(var(--foreground))",
            a: {
              color: "hsl(var(--foreground))",
              "&:hover": {
                color: "hsl(var(--foreground))",
              },
            },
            h1: {
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-ronzino)",
              fontWeight: "400",
            },
            h2: {
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-ronzino)",
              fontWeight: "400",
            },
            h3: {
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-ronzino)",
              fontWeight: "400",
            },
            h4: {
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-ronzino)",
              fontWeight: "400",
            },
            h5: {
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-ronzino)",
              fontWeight: "400",
            },
            h6: {
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-ronzino)",
              fontWeight: "400",
            },
            strong: {
              color: "hsl(var(--foreground))",
              fontWeight: "500",
            },
            code: {
              color: "hsl(var(--foreground))",
            },
            figcaption: {
              color: "hsl(var(--muted-foreground))",
            },
            blockquote: {
              color: "hsl(var(--foreground))",
              borderLeftColor: "hsl(var(--border))",
            },
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
