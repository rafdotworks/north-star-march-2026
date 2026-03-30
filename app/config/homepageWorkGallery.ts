/**
 * Homepage work gallery configuration.
 *
 * Each image owns its caption content directly so gallery text can be edited
 * image-by-image without shared project caption coupling.
 */

export interface HomeWorkCaption {
  label: string
  context: string
}

export interface HomeWorkFigure {
  src: string
  alt: string
  caption: HomeWorkCaption
  priority?: boolean
}

export const HOME_WORK_FIGURES = {
  obv1: {
    src: "/work/q2-26-works/obv/obv-1.png",
    alt: 'Obvious: chat interface with workflow progress and "remember this workflow" prompt',
    caption: {
      label: "Obvious",
      context: "AI skills, workflow memory, and interaction design, 2025",
    },
    priority: true,
  },
  walm5: {
    src: "/work/q2-26-works/walm/walm-5.png",
    alt: "Walmart: AI product or design detail",
    caption: {
      label: "Walmart",
      context: "Seller AI recommendations, trust systems, staff design, 2026",
    },
  },
  walm6: {
    src: "/work/q2-26-works/walm/walm-6.png",
    alt: "Walmart: AI product or design detail",
    caption: {
      label: "Walmart",
      context: "Seller AI recommendations, trust systems, staff design, 2026",
    },
  },
  theo2: {
    src: "/work/q2-26-works/theo/theo-2.png",
    alt: "Theoriq: Infinity Studio or Hub interface for AI agents",
    caption: {
      label: "Theoriq",
      context: "Founding designer, agent studio and marketplace, 2024-25",
    },
  },
  theo3: {
    src: "/work/q2-26-works/theo/theo-3.png",
    alt: "Theoriq: agent workspace or marketplace view",
    caption: {
      label: "Theoriq",
      context: "Founding designer, agent studio and marketplace, 2024-25",
    },
  },
  theo6: {
    src: "/work/q2-26-works/theo/theo-6.png",
    alt: "Theoriq: agent workspace or marketplace view",
    caption: {
      label: "Theoriq",
      context: "Founding designer, agent studio and marketplace, 2024-25",
    },
  },
  cb1: {
    src: "/work/q2-26-works/cb/cb-1.png",
    alt: "Coinbase Developer Platform: API docs or developer tools",
    caption: {
      label: "Coinbase Developer Platform",
      context: "SQL Playground, embedded wallets, and developer infrastructure, 2025",
    },
  },
  cb3: {
    src: "/work/q2-26-works/cb/cb-3.png",
    alt: "Coinbase Developer Platform: SQL Playground or query interface",
    caption: {
      label: "Coinbase Developer Platform",
      context: "SQL Playground, embedded wallets, and developer infrastructure, 2025",
    },
  },
  cb4: {
    src: "/work/q2-26-works/cb/cb-4.png",
    alt: "Coinbase Developer Platform: product surface or flow",
    caption: {
      label: "Coinbase Developer Platform",
      context: "SQL Playground, embedded wallets, and developer infrastructure, 2025",
    },
  },
  cb5: {
    src: "/work/q2-26-works/cb/cb-5.png",
    alt: "Coinbase Developer Platform: developer experience or onboarding",
    caption: {
      label: "Coinbase Developer Platform",
      context: "SQL Playground, embedded wallets, and developer infrastructure, 2025",
    },
  },
  vf1: {
    src: "/work/q2-26-works/vf/vf-1.png",
    alt: "Voiceflow: conversation design or dialog editor",
    caption: {
      label: "Voiceflow",
      context: "Activation flows, agent onboarding, senior product design, 2025",
    },
  },
  vf3: {
    src: "/work/q2-26-works/vf/vf-3.png",
    alt: "Voiceflow: agent builder or early activation flow",
    caption: {
      label: "Voiceflow",
      context: "Activation flows, agent onboarding, senior product design, 2025",
    },
  },
  vf4: {
    src: "/work/q2-26-works/vf/vf-4.png",
    alt: "Voiceflow: agent builder or early activation flow",
    caption: {
      label: "Voiceflow",
      context: "Activation flows, agent onboarding, senior product design, 2025",
    },
  },
  atl1: {
    src: "/work/q2-26-works/atl/atl-1.png",
    alt: "Atlas: crypto marketplace or NFT collections",
    caption: {
      label: "Atlas",
      context: "Marketplace, trading, and lending flows, product design, 2022-23",
    },
  },
  atl2: {
    src: "/work/q2-26-works/atl/atl-2.png",
    alt: "Atlas: trading, borrowing, or analytics view",
    caption: {
      label: "Atlas",
      context: "Marketplace, trading, and lending flows, product design, 2022-23",
    },
  },
  atl3: {
    src: "/work/q2-26-works/atl/atl-3.png",
    alt: "Atlas: trading, borrowing, or analytics view",
    caption: {
      label: "Atlas",
      context: "Marketplace, trading, and lending flows, product design, 2022-23",
    },
  },
  atl4: {
    src: "/work/q2-26-works/atl/atl-4.png",
    alt: "Atlas: trading, borrowing, or analytics view",
    caption: {
      label: "Atlas",
      context: "Marketplace, trading, and lending flows, product design, 2022-23",
    },
  },
  zl1: {
    src: "/work/q2-26-works/zl/zl-1.png",
    alt: "Zalando B2B: design system documentation or guidelines",
    caption: {
      label: "Zalando B2B Design System",
      context: "B2B design system foundations, patterns, and governance, 2021-22",
    },
  },
  zl2: {
    src: "/work/q2-26-works/zl/zl-2.png",
    alt: "Zalando B2B: design system components or patterns",
    caption: {
      label: "Zalando B2B Design System",
      context: "B2B design system foundations, patterns, and governance, 2021-22",
    },
  },
  zl3: {
    src: "/work/q2-26-works/zl/zl-3.png",
    alt: "Zalando B2B: design system components or patterns",
    caption: {
      label: "Zalando B2B Design System",
      context: "B2B design system foundations, patterns, and governance, 2021-22",
    },
  },
  zl6: {
    src: "/work/q2-26-works/zl/zl-6.png",
    alt: "Zalando B2B: design system components or patterns",
    caption: {
      label: "Zalando B2B Design System",
      context: "B2B design system foundations, patterns, and governance, 2021-22",
    },
  },
  ew1: {
    src: "/work/q2-26-works/ew/ew-1.png",
    alt: "Early work: brand or interface design",
    caption: {
      label: "Early Works",
      context: "Brands, interfaces, and websites for early-stage teams, 2016 onward",
    },
  },
  ew2: {
    src: "/work/q2-26-works/ew/ew-2.png",
    alt: "Early work: brand or product interface",
    caption: {
      label: "Early Works",
      context: "Brands, interfaces, and websites for early-stage teams, 2016 onward",
    },
  },
  ew3: {
    src: "/work/q2-26-works/ew/ew-3.png",
    alt: "Early work: visual design or website",
    caption: {
      label: "Early Works",
      context: "Brands, interfaces, and websites for early-stage teams, 2016 onward",
    },
  },
  ew4: {
    src: "/work/q2-26-works/ew/ew-4.png",
    alt: "Early work: product or brand project",
    caption: {
      label: "Early Works",
      context: "Brands, interfaces, and websites for early-stage teams, 2016 onward",
    },
  },
  ew5: {
    src: "/work/q2-26-works/ew/ew-5.png",
    alt: "Early work: interface or identity",
    caption: {
      label: "Early Works",
      context: "Brands, interfaces, and websites for early-stage teams, 2016 onward",
    },
  },
  ew6: {
    src: "/work/q2-26-works/ew/ew-6.png",
    alt: "Early work: design showcase",
    caption: {
      label: "Early Works",
      context: "Brands, interfaces, and websites for early-stage teams, 2016 onward",
    },
  },
  ew7: {
    src: "/work/q2-26-works/ew/ew-7.png",
    alt: "Early work: portfolio piece",
    caption: {
      label: "Early Works",
      context: "Brands, interfaces, and websites for early-stage teams, 2016 onward",
    },
  },
} satisfies Record<string, HomeWorkFigure>

export type HomeWorkFigureKey = keyof typeof HOME_WORK_FIGURES

export type HomeWorkLeadSection = readonly [HomeWorkFigureKey, ...HomeWorkFigureKey[]]

export interface HomeWorkMobileSections {
  lead: HomeWorkLeadSection
  current: readonly HomeWorkFigureKey[]
  theoriq: readonly HomeWorkFigureKey[]
  coinbase: readonly HomeWorkFigureKey[]
  voiceflow: readonly HomeWorkFigureKey[]
  atlas: readonly HomeWorkFigureKey[]
}

export interface HomeWorkDesktopSections {
  featured: HomeWorkLeadSection
  walmart: readonly HomeWorkFigureKey[]
  theoriq: readonly HomeWorkFigureKey[]
  coinbase: readonly HomeWorkFigureKey[]
  voiceflow: readonly HomeWorkFigureKey[]
  atlas: readonly HomeWorkFigureKey[]
  zalando: readonly HomeWorkFigureKey[]
  earlyWorks: readonly HomeWorkFigureKey[]
}

export const HOME_WORK_MOBILE_SECTIONS = {
  lead: ["obv1"],
  current: ["walm5", "walm6"],
  theoriq: ["theo2"],
  coinbase: ["cb1"],
  voiceflow: ["vf1"],
  atlas: ["atl1"],
} as const satisfies HomeWorkMobileSections

export const HOME_WORK_DESKTOP_SECTIONS = {
  featured: ["obv1"],
  walmart: ["walm5", "walm6"],
  theoriq: ["theo2", "theo3", "theo6"],
  coinbase: ["cb1", "cb3", "cb4", "cb5"],
  voiceflow: ["vf1", "vf3", "vf4"],
  atlas: ["atl1", "atl2", "atl3", "atl4"],
  zalando: ["zl1", "zl2", "zl3", "zl6"],
  earlyWorks: ["ew1", "ew2", "ew3", "ew4", "ew5", "ew6", "ew7"],
} as const satisfies HomeWorkDesktopSections
