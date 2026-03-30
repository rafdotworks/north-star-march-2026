import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Theme Token Preview | Raf V.",
  robots: {
    index: false,
    follow: false,
  },
};

type Token = {
  name: string;
  hex: string;
  hsl: string;
  usage: string;
};

type ThemePreview = {
  id: "light" | "dark";
  name: string;
  subtitle: string;
  viewportColor: string;
  bg: string;
  bgMuted: string;
  bgSubtle: string;
  fg: string;
  fgMuted: string;
  fgInverse: string;
  border: string;
  borderStrong: string;
  input: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  success: string;
  warning: string;
  codeBg: string;
  codeFg: string;
  ring: string;
  shadowSm: string;
  shadowMd: string;
  grainOpacity: string;
  grainBlend: string;
  anchors: string[];
  tokens: Token[];
};

const classGroups = [
  {
    title: "Typography",
    items: [
      "font-sans / font-serif",
      "font-edu-marist",
      "font-mono",
      "text-2xs text-xs text-sm text-base text-lg text-xl text-2xl",
      "type-caption",
      "type-body",
      "type-body-primary",
      "type-title",
    ],
  },
  {
    title: "Theme Utilities",
    items: [
      "bg-background",
      "text-foreground",
      "border-border",
      "bg-primary text-primary-foreground",
      "bg-secondary text-secondary-foreground",
      "bg-muted text-muted-foreground",
      "rounded-lg rounded-md rounded-sm",
      "shadow-sm shadow-md",
    ],
  },
  {
    title: "Measure",
    items: [
      "max-w-prose-narrow",
      "max-w-prose",
      "max-w-prose-wide",
      "max-w-reading",
      "max-w-article",
      "prose-container",
      "prose-article",
      "prose-article-narrow",
      "prose-article-wide",
    ],
  },
  {
    title: "Rhythm + Effects",
    items: [
      "rhythm-paragraph",
      "rhythm-section",
      "rhythm-list",
      "rhythm-heading",
      "animate-pulse-subtle",
      "transition-colors duration-200",
      "scrollbar-gutter-stable",
      "tray-about-text-fade",
    ],
  },
];

const themes: ThemePreview[] = [
  {
    id: "light",
    name: "Light Theme",
    subtitle: "Amalfi Dusk with warm cream typography and sand accents",
    viewportColor: "#2C4A6E",
    bg: "#2C4A6E",
    bgMuted: "#264060",
    bgSubtle: "#335680",
    fg: "#FAF6F0",
    fgMuted: "#D6CFC4",
    fgInverse: "#2C4A6E",
    border: "#3D5E84",
    borderStrong: "#4A6F96",
    input: "#264060",
    primary: "#E8D5B8",
    primaryForeground: "#1A2E46",
    secondary: "#335680",
    secondaryForeground: "#E8E0D4",
    accent: "#1F3755",
    accentForeground: "#E8D5B8",
    destructive: "#E25050",
    success: "#5CB88A",
    warning: "#E8A832",
    codeBg: "#1F3755",
    codeFg: "#E8E0D4",
    ring: "#E8D5B8",
    shadowSm: "0 1px 2px hsl(213 40% 5% / 0.12)",
    shadowMd: "0 8px 20px hsl(213 40% 5% / 0.18)",
    grainOpacity: "0.03",
    grainBlend: "overlay",
    anchors: ["#2C4A6E", "#FAF6F0", "#D6CFC4", "#E8D5B8"],
    tokens: [
      { name: "--bg", hex: "#2C4A6E", hsl: "hsl(213 43% 30%)", usage: "page background" },
      { name: "--bg-muted", hex: "#264060", hsl: "hsl(213 43% 26%)", usage: "muted surfaces" },
      { name: "--bg-subtle", hex: "#335680", hsl: "hsl(213 43% 35%)", usage: "subtle fills" },
      { name: "--fg", hex: "#FAF6F0", hsl: "hsl(36 56% 96%)", usage: "primary text" },
      { name: "--fg-muted", hex: "#D6CFC4", hsl: "hsl(37 22% 80%)", usage: "secondary text" },
      { name: "--border-color", hex: "#3D5E84", hsl: "hsl(213 37% 38%)", usage: "default borders" },
      { name: "--primary-color", hex: "#E8D5B8", hsl: "hsl(33 52% 82%)", usage: "main brand" },
      { name: "--secondary-color", hex: "#335680", hsl: "hsl(213 43% 35%)", usage: "secondary surface" },
      { name: "--accent-color", hex: "#1F3755", hsl: "hsl(213 47% 23%)", usage: "accent fill" },
      { name: "--destructive-color", hex: "#E25050", hsl: "hsl(0 72% 60%)", usage: "destructive state" },
      { name: "--success", hex: "#5CB88A", hsl: "hsl(150 38% 54%)", usage: "success state" },
      { name: "--warning", hex: "#E8A832", hsl: "hsl(40 82% 55%)", usage: "warning state" },
      { name: "--code-bg", hex: "#1F3755", hsl: "hsl(213 47% 23%)", usage: "code background" },
      { name: "--ring-color", hex: "#E8D5B8", hsl: "hsl(33 52% 82%)", usage: "focus ring" },
    ],
  },
  {
    id: "dark",
    name: "Dark Theme",
    subtitle: "Deeper navy background with sand-toned hierarchy and restrained contrast",
    viewportColor: "#141E2E",
    bg: "#141E2E",
    bgMuted: "#1A2738",
    bgSubtle: "#1F2F44",
    fg: "#FAF6F0",
    fgMuted: "#A89E90",
    fgInverse: "#141E2E",
    border: "#243548",
    borderStrong: "#2E4560",
    input: "#1A2738",
    primary: "#D6CFC4",
    primaryForeground: "#141E2E",
    secondary: "#1F2F44",
    secondaryForeground: "#D6CFC4",
    accent: "#182438",
    accentForeground: "#D6CFC4",
    destructive: "#E25050",
    success: "#5CB88A",
    warning: "#E8A832",
    codeBg: "#0F1A28",
    codeFg: "#C4BAA8",
    ring: "#D6CFC4",
    shadowSm: "0 1px 3px hsl(213 40% 5% / 0.3)",
    shadowMd: "0 4px 12px hsl(213 40% 5% / 0.45)",
    grainOpacity: "0.04",
    grainBlend: "overlay",
    anchors: ["#141E2E", "#1A2738", "#FAF6F0", "#D6CFC4"],
    tokens: [
      { name: "--bg", hex: "#141E2E", hsl: "hsl(213 40% 13%)", usage: "page background" },
      { name: "--bg-muted", hex: "#1A2738", hsl: "hsl(213 38% 16%)", usage: "muted surfaces" },
      { name: "--bg-subtle", hex: "#1F2F44", hsl: "hsl(213 38% 19%)", usage: "subtle fills" },
      { name: "--fg", hex: "#FAF6F0", hsl: "hsl(36 56% 96%)", usage: "primary text" },
      { name: "--fg-muted", hex: "#A89E90", hsl: "hsl(34 14% 61%)", usage: "secondary text" },
      { name: "--border-color", hex: "#243548", hsl: "hsl(213 33% 21%)", usage: "default borders" },
      { name: "--primary-color", hex: "#D6CFC4", hsl: "hsl(37 22% 80%)", usage: "main brand" },
      { name: "--secondary-color", hex: "#1F2F44", hsl: "hsl(213 38% 19%)", usage: "secondary surface" },
      { name: "--accent-color", hex: "#182438", hsl: "hsl(213 40% 16%)", usage: "accent fill" },
      { name: "--destructive-color", hex: "#E25050", hsl: "hsl(0 72% 60%)", usage: "destructive state" },
      { name: "--success", hex: "#5CB88A", hsl: "hsl(150 38% 54%)", usage: "success state" },
      { name: "--warning", hex: "#E8A832", hsl: "hsl(40 82% 55%)", usage: "warning state" },
      { name: "--code-bg", hex: "#0F1A28", hsl: "hsl(213 45% 11%)", usage: "code background" },
      { name: "--ring-color", hex: "#D6CFC4", hsl: "hsl(37 22% 80%)", usage: "focus ring" },
    ],
  },
];

function TokenCard({ token, theme }: { token: Token; theme: ThemePreview }) {
  return (
    <div
      className="rounded-2xl border p-3"
      style={{
        backgroundColor: theme.bgMuted,
        borderColor: theme.border,
        boxShadow: theme.shadowSm,
      }}
    >
      <div className="mb-3 flex items-start gap-3">
        <div
          className="h-11 w-11 shrink-0 rounded-xl border"
          style={{ backgroundColor: token.hex, borderColor: theme.borderStrong }}
        />
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-[0.02em]" style={{ color: theme.fg }}>
            {token.name}
          </p>
          <p className="font-mono text-[10px] leading-[1.5]" style={{ color: theme.fgMuted }}>
            {token.hex}
          </p>
        </div>
      </div>
      <p className="font-mono text-[10px] leading-[1.5]" style={{ color: theme.fgMuted }}>
        {token.hsl}
      </p>
      <p className="mt-2 text-xs leading-[1.45]" style={{ color: theme.fgMuted }}>
        {token.usage}
      </p>
    </div>
  );
}

function ThemePanel({ theme }: { theme: ThemePreview }) {
  return (
    <section
      className="overflow-hidden rounded-[28px] border"
      style={{
        backgroundColor: theme.bg,
        color: theme.fg,
        borderColor: theme.borderStrong,
        boxShadow: theme.shadowMd,
      }}
    >
      <div className="border-b px-6 py-5 md:px-7" style={{ borderColor: theme.border }}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ borderColor: theme.borderStrong, color: theme.fgMuted }}
          >
            {theme.name}
          </span>
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px]"
            style={{ borderColor: theme.border, color: theme.fgMuted }}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: theme.viewportColor }}
            />
            viewport {theme.viewportColor}
          </span>
        </div>
        <h2 className="font-edu-marist text-2xl leading-[0.95] tracking-[-0.04em] md:text-[2rem]">
          {theme.name}
        </h2>
        <p className="mt-3 max-w-[42ch] text-sm leading-[1.6]" style={{ color: theme.fgMuted }}>
          {theme.subtitle}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {theme.anchors.map((color) => (
            <div
              key={color}
              className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5"
              style={{ borderColor: theme.border }}
            >
              <span
                className="inline-block h-3 w-3 rounded-full border"
                style={{ backgroundColor: color, borderColor: theme.borderStrong }}
              />
              <span className="font-mono text-[10px]" style={{ color: theme.fgMuted }}>
                {color}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 md:px-7">
        <div
          className="rounded-[24px] border p-5"
          style={{ backgroundColor: theme.bgSubtle, borderColor: theme.border }}
        >
          <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: theme.fgMuted }}>
            Sample Surface
          </p>
          <h3 className="mt-3 font-edu-marist text-[1.8rem] leading-[0.95] tracking-[-0.04em]">
            Amalfi Dusk
          </h3>
          <p className="mt-3 max-w-[34ch] text-sm leading-[1.65]" style={{ color: theme.fgMuted }}>
            A restrained blue-ground palette with cream typography, sand highlights, and warmer
            shadowing. This makes the site feel more atmospheric without sliding into glow-heavy UI.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
              style={{ backgroundColor: theme.primary, color: theme.primaryForeground }}
            >
              Primary action
            </button>
            <button
              className="rounded-full border px-4 py-2 text-sm transition-colors"
              style={{
                backgroundColor: theme.secondary,
                color: theme.secondaryForeground,
                borderColor: theme.borderStrong,
              }}
            >
              Secondary
            </button>
            <button
              className="rounded-full border px-4 py-2 text-sm transition-colors"
              style={{
                backgroundColor: theme.accent,
                color: theme.accentForeground,
                borderColor: theme.border,
              }}
            >
              Accent fill
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <div
              className="rounded-2xl border px-4 py-3"
              style={{
                backgroundColor: theme.input,
                borderColor: theme.borderStrong,
                boxShadow: `0 0 0 1px ${theme.ring} inset`,
              }}
            >
              <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: theme.fgMuted }}>
                Input
              </p>
              <p className="mt-2 text-sm" style={{ color: theme.fg }}>
                raf@works.dev
              </p>
            </div>

            <div className="flex flex-wrap items-start gap-2">
              {[
                { label: "Success", color: theme.success },
                { label: "Warning", color: theme.warning },
                { label: "Destructive", color: theme.destructive },
              ].map((item) => (
                <span
                  key={item.label}
                  className="inline-flex rounded-full px-3 py-1 text-[11px] font-medium"
                  style={{ backgroundColor: item.color, color: theme.fgInverse }}
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <pre
            className="mt-5 overflow-x-auto rounded-2xl border p-4 font-mono text-[11px] leading-[1.65]"
            style={{
              backgroundColor: theme.codeBg,
              color: theme.codeFg,
              borderColor: theme.border,
            }}
          >
{`bg: ${theme.bg}
fg: ${theme.fg}
primary: ${theme.primary}
ring: ${theme.ring}
shadow-md: ${theme.shadowMd}`}
          </pre>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: theme.fgMuted }}>
                Token Grid
              </p>
              <p className="mt-1 text-sm" style={{ color: theme.fgMuted }}>
                Key palette values from the suggestion file.
              </p>
            </div>
            <div className="text-right font-mono text-[10px]" style={{ color: theme.fgMuted }}>
              grain {theme.grainOpacity} / {theme.grainBlend}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {theme.tokens.map((token) => (
              <TokenCard key={token.name} token={token} theme={theme} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ThemeTokenPreviewPage() {
  return (
    <main className="min-h-dvh bg-background px-6 py-8 text-foreground md:px-10 md:py-10">
      <div className="mx-auto max-w-[1480px]">
        <header className="mb-8 border-b border-border pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55">
              Preview Route
            </span>
            <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] text-foreground/55">
              /theme-token-preview
            </span>
          </div>

          <div className="mt-4 max-w-[62rem]">
            <h1 className="font-edu-marist text-[2.5rem] leading-[0.92] tracking-[-0.05em] text-foreground md:text-[4rem]">
              Suggested Theme Token Preview
            </h1>
            <p className="mt-4 max-w-[56ch] text-sm leading-[1.7] text-muted-foreground md:text-base">
              This page visualizes the palette direction from
              {" "}
              <span className="font-mono text-foreground/80">THEME_TOKEN_SHEET-SUGGESTION.md</span>.
              It does not change the live site theme in
              {" "}
              <span className="font-mono text-foreground/80">app/globals.css</span>.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link
              href="/"
              className="rounded-full border border-border px-4 py-2 text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              Back Home
            </Link>
            <span className="rounded-full bg-foreground/[0.04] px-4 py-2 text-foreground/60">
              Side-by-side light and dark panels
            </span>
            <span className="rounded-full bg-foreground/[0.04] px-4 py-2 text-foreground/60">
              Token cards plus sample UI states
            </span>
          </div>
        </header>

        <section className="grid gap-8 2xl:grid-cols-2">
          {themes.map((theme) => (
            <ThemePanel key={theme.id} theme={theme} />
          ))}
        </section>

        <section className="mt-8 rounded-[28px] border border-border bg-background/80 p-6 md:p-7">
          <div className="max-w-[64rem]">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Usable Classes
            </p>
            <h2 className="mt-3 font-edu-marist text-2xl leading-[0.98] tracking-[-0.04em] text-foreground">
              Existing class cheat sheet against the suggested palette
            </h2>
            <p className="mt-3 text-sm leading-[1.65] text-muted-foreground">
              These classes already exist in the repo. If you decide to adopt the suggested palette,
              these are the primary entry points that would inherit the new token values.
            </p>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {classGroups.map((group) => (
              <div key={group.title} className="rounded-3xl border border-border bg-foreground/[0.02] p-5">
                <h3 className="font-edu-marist text-lg tracking-[-0.02em] text-foreground">
                  {group.title}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <code
                      key={item}
                      className="rounded-full border border-border bg-background px-3 py-1.5 font-mono text-[11px] text-foreground/75"
                    >
                      {item}
                    </code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
