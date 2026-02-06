import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "raf.works — 2026",
  description:
    "Raf V. — Staff UX Designer. Interaction models for AI products at scale.",
}

export default function TextPage() {
  return (
    <main
      className="min-h-screen flex items-center"
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-20 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr] md:gap-x-16">
          <div className="md:col-start-2 max-w-[600px]">
            {/* Header */}
            <header className="mb-16 space-y-1">
              <h1 className="type-title">raf.works</h1>
              <p className="type-body">is <span className="font-edu-marist">Raf</span> V.</p>
            </header>

            {/* Statement */}
            <section className="mb-16 space-y-6">
              <p className="type-body-primary">
                I design interaction models for AI products at scale, currently
                Staff UX Designer at Walmart Seller.
              </p>
              <p className="type-body">
                Previously designed AI at Obvious, founding designer at Theoriq,
                and senior roles at Coinbase and Voiceflow. Background in
                software engineering.
              </p>
              <p className="type-body">
                Born and raised on the Amalfi Coast. Based in{" "}
                <span className="line-through opacity-50">Lisbon</span>{" "}
                <span className="line-through opacity-50">New York</span>{" "}
                Toronto. Relocating summer 2026.
              </p>
              <p className="type-body">
                I focus on agentic workflows, tool orchestration, and closing the
                gap between what AI can do and what users trust it to do.
              </p>
            </section>

            {/* Contact */}
            <footer
              className="pt-8"
              style={{ borderTop: "1px solid var(--border-color)" }}
            >
              <div className="flex gap-6">
                <a
                  href="mailto:raf@raf.works"
                  className="type-caption transition-colors duration-200"
                  style={{ color: "var(--fg-muted)" }}
                >
                  Email
                </a>
                <a
                  href="https://linkedin.com/in/raffaelevitaledesign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="type-caption transition-colors duration-200"
                  style={{ color: "var(--fg-muted)" }}
                >
                  LinkedIn
                </a>
                <a
                  href="https://x.com/rafdotworks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="type-caption transition-colors duration-200"
                  style={{ color: "var(--fg-muted)" }}
                >
                  X
                </a>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </main>
  )
}
