/**
 * Slide content data for /slides route
 * Based on DOCS/deck-raf.md
 */

export type SlideType =
  | "cover"
  | "manifesto"
  | "throughline"
  | "principles"
  | "what-i-do"
  | "project"
  | "system-bridge"
  | "act"
  | "voices"
  | "how-i-work"
  | "fit"
  | "closing";

export type FitSlideContent = {
  bestFit: string[];
  notFor: string[];
};

export interface SlideData {
  id: number;
  type: SlideType;
  title?: string;
  subtitle?: string;
  content?: string | string[] | FitSlideContent;
  details?: string;
  caption?: string;
  images?: string[];
  metadata?: {
    company?: string;
    role?: string;
    highlights?: string[];
  };
}

export const slidesData: SlideData[] = [
  // Slide 1 — Cover
  {
    id: 1,
    type: "cover",
    title: "Designing clarity for complex systems.",
    subtitle: "Senior Product Designer & Design Engineer",
    details: "Toronto / Lisbon · raf@raf.works · raf.works",
  },

  // Slide 2 — Manifesto
  {
    id: 2,
    type: "manifesto",
    content: [
      "I design systems that make complex tech feel calm — and shippable.",
      "I work where design meets code: shaping tokens, logic, and interfaces that feel inevitable. From AI agents to fintech tools, I turn friction into flow — balancing clarity, speed, and taste.",
    ],
  },

  // Slide 3 — Throughline
  {
    id: 3,
    type: "throughline",
    title: "Complexity → Clarity",
    content: [
      "Discover: what's messy",
      "Define: the structure",
      "Deliver: clarity in code",
    ],
    caption: "My craft scales across layers — from architecture to the pixels that make it breathe.",
  },

  // Slide 4 — Principles
  {
    id: 4,
    type: "principles",
    title: "Principles",
    content: [
      "Clarity over cleverness — fewer steps, stronger defaults",
      "Systems before screens — names, tokens, contracts with code",
      "Momentum matters — ship thin, learn fast",
      "Taste is leverage — brutalist honesty, calm UI, no theater",
    ],
  },

  // Slide 5 — What I do now
  {
    id: 5,
    type: "what-i-do",
    title: "What I do now",
    subtitle: "Design systems in code. AI / Agent UX. Fintech-grade flows.",
    content: [
      "I help teams move from idea to implementation without losing clarity.",
      "Bridging designers and engineers through shared systems, semantic tokens, and speed.",
    ],
  },

  // Slide 6 — Act I / Foundation
  {
    id: 6,
    type: "act",
    title: "Act I / Foundation",
  },

  // Slide 7 — Zalando
  {
    id: 7,
    type: "project",
    metadata: {
      company: "Zalando SE",
      role: "Lead Product Designer, Design System",
      highlights: [
        "Built Zalando's first B2B design system.",
        "Unified components and documentation across products — improving delivery efficiency by 40%.",
        "→ Foundation for consistent, fast-moving multi-team design.",
      ],
    },
    images: ["/work/zalando-spread.png", "/work/zalando-dodont.png"],
  },

  // Slide 8 — CurbCut
  {
    id: 8,
    type: "project",
    title: "Accessibility as System",
    metadata: {
      company: "CurbCutOS",
      role: "Product Design Lead",
      highlights: [
        "Transformed a manual accessibility consultancy into a scalable SaaS platform.",
        "Automated workflows cut 40 hours per audit and surfaced 66% more accessibility barriers.",
        "→ Designed for inclusion at scale — structure as a form of care.",
      ],
    },
    images: ["/work/curbcut.png"],
  },

  // Slide 9 — Act II / Expansion
  {
    id: 9,
    type: "act",
    title: "Act II / Expansion",
  },

  // Slide 10 — Coinbase
  {
    id: 10,
    type: "project",
    metadata: {
      company: "Coinbase Developer Platform",
      role: "Senior Product Designer",
      highlights: [
        "Led design for developer-facing tools under CDP.",
        "• SQL Playground: query blockchain data with no setup.",
        "• Embedded Wallets: seamless email OTP auth for user-custodied wallets.",
        "→ Designed fintech rigor with simplicity at scale.",
      ],
    },
    images: ["/work/cb-1.png", "/work/cb-d.png"],
  },

  // Slide 11 — Theoriq
  {
    id: 11,
    type: "project",
    title: "AI Commerce & Trust",
    metadata: {
      company: "Theoriq",
      role: "Founding Product Designer",
      highlights: [
        "Designed modular AI-agent experiences from zero.",
        "Built Figma + Storybook design system, brand, and marketing foundation.",
        "Grew to 120k daily users in 4 months.",
        "→ Simplified complexity to scale trust in AI.",
      ],
    },
    images: ["/work/theoriq.png", "/work/theoriq-prod-hero.png"],
  },

  // Slide 12 — System Bridge
  {
    id: 12,
    type: "system-bridge",
    title: "Design → Code (System Bridge)",
    subtitle: "My system → your speed",
    content: [
      "• Semantic tokens for color, type, spacing synced Figma ↔ Next.js.",
      "• Shadcn + Storybook component library ready for production.",
      "• One source of truth for design and code.",
    ],
  },

  // Slide 13 — Frequency
  {
    id: 13,
    type: "project",
    metadata: {
      company: "Frequency",
      role: "Founding Design Engineer",
      highlights: [
        "Built the first digital design system for Frequency — merging design and code.",
        "Defined semantic architecture for tokens and color modes.",
        "Paired with engineers to ship the earliest UIs using Claude Code + MCP in Figma.",
        "→ Made an idea feel real through clarity and speed.",
      ],
    },
  },

  // Slide 14 — Act III / Now
  {
    id: 14,
    type: "act",
    title: "Act III / Now",
    content: [
      "I'm focused on building systems for the next wave of human–AI collaboration.",
      "Tools that bridge autonomy and trust.",
      "Interfaces that simplify what feels overwhelming.",
      "→ Design engineering as translation, not separation.",
    ],
  },

  // Slide 15 — Voices
  {
    id: 15,
    type: "voices",
    content: [
      '"Raf moves from vision to implementation faster than anyone I\'ve worked with." — Braden Ream, CEO, Voiceflow',
      '"He sees systems before screens — and ships them." — Ron Bodkin, CEO, Theoriq',
    ],
  },

  // Slide 16 — How I Work
  {
    id: 16,
    type: "how-i-work",
    title: "How I Work",
    content: [
      "Diagnose fast — find the core constraint",
      "Design in public with eng — shared language through tokens and code",
      "Ship thin — momentum creates trust",
    ],
  },

  // Slide 17 — Fit
  {
    id: 17,
    type: "fit",
    title: "Fit",
    content: {
      bestFit: ["0 → 1 systems", "AI / agent UX", "Fintech & infra interfaces"],
      notFor: ["heavy process", "design theater", "slow loops"],
    },
  },

  // Slide 18 — Closing
  {
    id: 18,
    type: "closing",
    title: "Let's build calmly.",
    content: "I design the systems that make speed feel natural.",
    details: "raf@raf.works · Toronto / Lisbon · LinkedIn / deck.raf.works",
  },
];
