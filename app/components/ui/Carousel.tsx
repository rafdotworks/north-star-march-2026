import React, { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Molly‑style Work Carousel
 * — Contained section
 * — Horizontal scroll + snap per slide (no autoplay / no loop)
 * — Clean UI with subtle parallax + motion
 * — Mobile + Desktop
 * — Next.js + Tailwind + Framer Motion compatible
 *
 * Drop-in usage:
 * <WorkCarousel items={demoItems} />
 */

export type WorkItem = {
  title: string;
  subtitle?: string;
  imageSrc: string;
  href?: string;
  tags?: string[];
};

export function WorkCarousel({ items }: { items: WorkItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Horizontal scroll progress as a motion value [0..1]
  const progress = useMotionValue(0);
  const smoothProgress = useSpring(progress, {
    stiffness: 120,
    damping: 24,
    mass: 0.6,
  });

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const next = max > 0 ? el.scrollLeft / max : 0;
    progress.set(next);
  }, [progress]);

  // Progress bar width (subtle)
  const barScaleX = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <section className="relative mx-auto w-full max-w-6xl select-none">
      {/* Header row (optional) */}
      <div className="mb-6 flex items-end justify-between px-2 md:px-0">
        <div>
          <h2 className="text-base font-normal tracking-tight text-foreground/60 font-edu-marist">
            Work
          </h2>
          <p className="text-xs text-foreground/40">Selected projects</p>
        </div>
        {/* Progress bar */}
        <div className="hidden h-0.5 w-32 overflow-hidden rounded-full bg-foreground/10 sm:block">
          <motion.div
            style={{ scaleX: barScaleX, transformOrigin: "left" }}
            className="h-full w-full bg-accent"
          />
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="group relative flex w-full snap-x snap-mandatory gap-6 overflow-x-auto overflow-y-hidden [scrollbar-width:none]"
      >
        {/* Hide scrollbar (Firefox via class above, WebKit via utility below) */}
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {items.map((item, idx) => (
          <Slide
            key={idx}
            item={item}
            index={idx}
          />
        ))}
      </div>

      {/* Mobile progress bar */}
      <div className="mt-4 block h-0.5 w-full overflow-hidden rounded-full bg-foreground/10 sm:hidden">
        <motion.div
          style={{ scaleX: barScaleX, transformOrigin: "left" }}
          className="h-full w-full bg-accent"
        />
      </div>
    </section>
  );
}

function Slide({ item, index }: { item: WorkItem; index: number }) {
  // Alternate between two card styles
  const isLayeredStyle = index % 2 === 0;

  // Layout sizing: show almost one card per view (contained), snap per card
  return (
    <motion.article
      className="relative snap-start flex-none"
      style={{
        minWidth: "85%",
        maxWidth: "85%",
        height: "280px", // Shorter height to match reference
      }}
    >
      {isLayeredStyle ? (
        // Layered style (exact layout from reference)
        <>
          <div className="relative h-full w-full rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200/50">
            {/* Layered visual elements */}
            <div className="absolute inset-0 p-6">
              {/* Back layer - dark strip with quote icon */}
                <div className="absolute left-0 top-6 w-16 h-32 bg-gray-800 rounded-r-2xl flex items-start justify-center pt-4">
                  <div className="w-6 h-6 text-white text-lg font-bold">
                    &quot;
                  </div>
              </div>

              {/* Middle layer - image card */}
              <div className="absolute right-8 top-8 w-32 h-40 bg-white rounded-xl shadow-lg overflow-hidden">
                <img
                  src={item.imageSrc}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2">
                  <div className="text-xs font-medium">{item.title}</div>
                  <div className="text-xs opacity-80">Visit Site</div>
                </div>
                {/* Top right icon */}
                <div className="absolute top-2 right-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 17L17 7M17 7H9M17 7V15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Front layer - main content card */}
              <div className="absolute right-4 top-4 w-40 h-48 bg-white rounded-xl shadow-xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 leading-tight">
                    {item.title} for {item.tags?.[0] || "Project"}
                  </h3>
                </div>
                <div className="flex items-center justify-between">
                  <button className="text-xs text-blue-600 font-medium hover:text-blue-800">
                    Read More
                  </button>
                  {/* Top right @ icon */}
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">@</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Bold text style (exact layout from reference)
        <div className="relative h-full w-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-gray-800">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-2">
                Welcome the{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {item.title}
                </span>
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* Content below the visual card */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {item.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">{item.subtitle}</p>
      </div>
    </motion.article>
  );
}

function Dots({ index, total }: { index: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={[
            "h-1.5 w-1.5 rounded-full",
            i === index ? "bg-accent" : "bg-foreground/20",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

// ————————————————————————————————————————————
// Demo data (using actual project images)
// ————————————————————————————————————————————
export const demoItems: WorkItem[] = [
  {
    title: "Atlas",
    subtitle:
      "Designing the future of DeFi with clean, intuitive interfaces that make complex financial products accessible to everyone.",
    imageSrc: "/work/atlas-1.png",
    href: "#",
    tags: ["DeFi", "Product Design"],
  },
  {
    title: "Theoriq",
    subtitle:
      "Building AI-powered design tools that help teams create better products faster through intelligent automation.",
    imageSrc: "/work/theoriq.png",
    href: "#",
    tags: ["AI", "Design Tools"],
  },
  {
    title: "Zalando",
    subtitle:
      "Crafting cohesive design systems and user experiences for Europe's leading fashion platform.",
    imageSrc: "/work/zalando.png",
    href: "#",
    tags: ["E-commerce", "Design System"],
  },
  {
    title: "Coinbase",
    subtitle:
      "Designing secure, user-friendly interfaces for cryptocurrency trading and portfolio management.",
    imageSrc: "/work/cb-1.png",
    href: "#",
    tags: ["Crypto", "Fintech"],
  },
];

export default function Carousel() {
  return (
    <div className="py-8">
      <div className="px-4 md:px-6">
        <WorkCarousel items={demoItems} />
      </div>
    </div>
  );
}
