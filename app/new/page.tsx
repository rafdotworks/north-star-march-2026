"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { fadeInUp, staggerDelays, getStaggerDelay } from "./lib/animations";
import { typography, opacity, spacing, layout } from "./lib/typography";
import { linkStyles } from "./lib/link-styles";
import { WorkCarousel } from "./components/WorkCarousel";

export default function NewPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col md:flex-row">
        {/* Left Sidebar - Hidden on mobile, shows border animation on desktop */}
        <motion.aside
          className={`hidden md:block ${layout.sidebar.width} ${spacing.container.desktop} ${layout.sidebar.border} overflow-hidden`}
          initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
          animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
          transition={{
            duration: 2.5,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.3,
          }}
        >
          <div className="opacity-0">
            {/* Invisible spacer to maintain layout */}
            <div className="text-[11px] mb-10">← Index</div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className={`flex-1 px-6 py-10 md:px-12 md:py-12`}>
          <div className={layout.maxWidth}>
            {/* Header */}
            <motion.div
              className={spacing.margins.header}
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{
                ...fadeInUp.transition,
                delay: staggerDelays.header,
              }}
            >
              <h1
                className={`${typography.sizes.heading} ${typography.families.heading} ${typography.weights.normal} mb-0.5 ${typography.tracking.tight}`}
              >
                Raf V
              </h1>
              <p
                className={`${typography.sizes.small} ${opacity.tertiary} ${typography.leading.relaxed} ${typography.tracking.normal}`}
              >
                Senior Product Designer and Design Engineer
              </p>
            </motion.div>

            {/* Bio Content */}
            <div
              className={`${spacing.sections.small} ${typography.sizes.body} ${typography.leading.relaxed} ${typography.tracking.normal}`}
            >
              <motion.p
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{
                  ...fadeInUp.transition,
                  delay: getStaggerDelay(0),
                }}
              >
                I was born on the Amalfi Coast, Italy, and now live between
                Toronto, Canada and Lisbon, Portugal.
              </motion.p>

              <motion.p
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{
                  ...fadeInUp.transition,
                  delay: getStaggerDelay(1),
                }}
              >
                I studied software engineer but my career started 7 years ago in
                design after graduating <em>cum laude</em>.
              </motion.p>

              <motion.p
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{
                  ...fadeInUp.transition,
                  delay: getStaggerDelay(2),
                }}
              >
                Over the years I&apos;ve moved through different stages of
                building, from early-stage zero-to-one to global teams: for
                clarity, simplicity, and impact.
              </motion.p>
            </div>

            {/* Work Carousel */}
            <div className="mt-6 mb-4 h-[260px] md:h-[320px] overflow-hidden">
              <WorkCarousel />
            </div>

            {/* Closing Content */}
            <div
              className={`${spacing.sections.small} ${typography.sizes.body} ${typography.leading.relaxed} ${typography.tracking.normal}`}
            >
              <motion.p
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{
                  ...fadeInUp.transition,
                  delay: 1.0,
                }}
              >
                Lately I&apos;ve been reflecting on where to bring more depth,
                craft, and clarity next.
              </motion.p>

              <motion.p
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={{
                  ...fadeInUp.transition,
                  delay: 1.1,
                }}
              >
                You can reach me at{" "}
                <Link href="mailto:raf@raf.works" className={linkStyles.inline}>
                  raf@raf.works
                </Link>{" "}
                or find me usually building, taking portraits, or meditating
                here and there.
              </motion.p>
            </div>

            {/* Footer */}
            <motion.footer
              className={`${spacing.margins.footer} border-t border-foreground/[0.08]`}
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...fadeInUp.transition, delay: 1.2 }}
            >
              <p
                className={`${typography.sizes.tiny} ${opacity.subtle} italic ${typography.tracking.normal}`}
              >
                Be kind, work hard, spread joy
              </p>
            </motion.footer>
          </div>
        </div>
      </div>
    </main>
  );
}
