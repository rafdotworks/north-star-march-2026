import type { CSSProperties } from "react"
import ClientInteractions from "./ClientInteractions"
import styles from "./portfolio.module.css"

const sections = [
  { id: "what-this-is", label: "What this is" },
  { id: "what-it-replaces", label: "What it replaces" },
  { id: "how-you-use-it", label: "How you use it" },
  { id: "how-systems-use-it", label: "How systems use it" },
  { id: "live-interaction", label: "Live interaction" },
  { id: "edge-cases", label: "Edge cases" },
  { id: "rules-of-use", label: "Rules of use" },
  { id: "access-licensing", label: "Access & licensing" },
]

const enter = (delay: number): CSSProperties =>
  ({ "--enter-delay": `${delay}ms` } as CSSProperties)

export default function PortfolioPage() {
  return (
    <main className={styles.page} data-portfolio-root data-motion="on">
      <ClientInteractions sectionIds={sections.map((section) => section.id)} />
      <a className={styles.skipLink} href="#content-start">
        Skip to content
      </a>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.brand} data-enter style={enter(0)}>
            <div className={styles.logomark}>
              ( - - )
              <br />\( = )/
            </div>
            <div className={styles.brandName}>Raf</div>
            <div className={styles.brandMeta}>Portfolio system</div>
          </div>
          <nav className={styles.nav} aria-label="Section navigation" data-enter style={enter(60)}>
            <div className={styles.navLabel}>Overview</div>
            <ul className={styles.navList}>
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    className={styles.navLink}
                    href={`#${section.id}`}
                    data-section={section.id}
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.sidebarMeta} data-enter style={enter(120)}>
            <span className={styles.versionTag}>v2026.02</span>
            <button className={styles.motionToggle} type="button" data-motion-toggle>
              Motion: On
            </button>
            <span>Last update: Feb 5, 2026</span>
          </div>
        </aside>

        <div className={styles.content} id="content-start">
          <header className={styles.hero}>
            <span
              className={styles.floatDot}
              aria-hidden="true"
              style={{
                top: "8%",
                left: "72%",
                "--duration": "5.4s",
                "--delay": "0.2s",
                "--drift-x": "10px",
                "--drift-y": "-8px",
              } as CSSProperties}
            />
            <span
              className={`${styles.floatDot} ${styles.floatDotSecondary}`}
              aria-hidden="true"
              style={{
                top: "58%",
                left: "36%",
                "--duration": "4.6s",
                "--delay": "0.6s",
                "--drift-x": "-12px",
                "--drift-y": "10px",
              } as CSSProperties}
            />
            <div className={styles.heroPill} data-enter style={enter(0)}>
              <span className={styles.heroPillDot} />
              Update · Feb 5, 2026 · Living README
            </div>
            <h1 className={styles.heroTitle} data-enter style={enter(80)}>
              Portfolio. Living README.
            </h1>
            <p className={styles.heroLead} data-enter style={enter(140)}>
              This page is the index of Raf&apos;s design and engineering work. It answers specific
              questions without a call.
            </p>
            <div className={styles.heroActions} data-enter style={enter(200)}>
              <button
                className={styles.buttonPrimary}
                type="button"
                data-copy="raf@domain.com"
                data-label="Copy email"
                aria-live="polite"
              >
                Copy email
              </button>
              <button className={styles.buttonSecondary} type="button" data-copy="/resume.pdf" data-label="Copy resume link" aria-live="polite">
                Copy resume link
              </button>
              <span className={styles.inlineCode}>raf@domain.com</span>
            </div>

            <div className={styles.windowMock} data-enter style={enter(260)}>
              <div className={styles.windowTop}>
                <span className={styles.windowDot} />
                <span className={styles.windowDot} />
                <span className={styles.windowDot} />
                <span className={styles.windowAddress}>portfolio.local</span>
              </div>
              <div className={styles.windowBody}>
                <div className={styles.windowRow}>
                  <span className={styles.windowSquare} />
                  <span className={styles.windowHighlight}>Selected work</span>
                </div>
                <div className={styles.windowCardRow}>
                  <div className={styles.windowCard} />
                  <div className={styles.windowCard} />
                  <div className={styles.windowCard} />
                </div>
                <div className={styles.windowRow}>
                  <span className={styles.windowSquare} />
                  <div className={styles.windowCard} />
                </div>
              </div>
            </div>
          </header>

          <section id="what-this-is" className={styles.section}>
            <h2 className={styles.sectionHeading}>What this is</h2>
            <p className={styles.sectionLead}>
              A portfolio and website for Raf. It doubles as a README for current work.
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>The index for projects, roles, and outcomes.</li>
              <li className={styles.listItem}>Anchors that point to case studies.</li>
              <li className={styles.listItem}>A reference for collaborators and hiring teams.</li>
            </ul>
          </section>

          <section id="what-it-replaces" className={styles.section}>
            <h2 className={styles.sectionHeading}>What it replaces</h2>
            <p className={styles.sectionLead}>
              It replaces materials that get rebuilt for each request.
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>Slide decks that go stale.</li>
              <li className={styles.listItem}>Long intro calls before evidence.</li>
              <li className={styles.listItem}>PDFs that drift from current work.</li>
            </ul>
          </section>

          <section id="how-you-use-it" className={styles.section}>
            <h2 className={styles.sectionHeading}>How you use it</h2>
            <p className={styles.sectionLead}>
              Share the link and point to a section. The page is written to be read out of order.
            </p>
            <ol className={styles.steps}>
              <li className={styles.stepItem}>Send the URL.</li>
              <li className={styles.stepItem}>Anchor to a section that matches the ask.</li>
              <li className={styles.stepItem}>Open a project and scan the summary.</li>
              <li className={styles.stepItem}>Copy the contact block if you need fast follow-up.</li>
            </ol>
            <div className={styles.note}>
              <span className={styles.noteLabel}>Note</span>
              <span className={styles.noteText}>
                Replace placeholders as you ship. Leave the structure intact so readers can skim.
              </span>
            </div>
          </section>

          <section id="how-systems-use-it" className={styles.section}>
            <h2 className={styles.sectionHeading}>How systems use it</h2>
            <p className={styles.sectionLead}>
              The structure is labeled so tools can parse it without guesswork.
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>Search engines read headings and anchors that stay the same.</li>
              <li className={styles.listItem}>Screen readers follow the same hierarchy.</li>
              <li className={styles.listItem}>AI tools can extract sections with less cleanup.</li>
            </ul>
          </section>

          <section id="live-interaction" className={styles.section}>
            <h2 className={styles.sectionHeading}>Live interaction</h2>
            <p className={styles.sectionLead}>
              Click a project to expand details. Close it to return to the index state.
            </p>
            <div className={styles.workGrid}>
              <details className={styles.workItem}>
                <summary className={styles.workSummary}>
                  Placeholder Project One
                  <span className={styles.workMeta}>2025 · Product design</span>
                </summary>
                <div className={styles.workContent}>
                  <div>Scope: onboarding flow, data entry, and review tools.</div>
                  <div>Outcome: replace with a measurable result.</div>
                  <div>Artifacts: case study, UI kit, interaction notes.</div>
                </div>
              </details>
              <details className={styles.workItem}>
                <summary className={styles.workSummary}>
                  Placeholder Project Two
                  <span className={styles.workMeta}>2024 · Design systems</span>
                </summary>
                <div className={styles.workContent}>
                  <div>Scope: system audit and component rebuild.</div>
                  <div>Outcome: replace with a measurable result.</div>
                  <div>Artifacts: tokens, guidelines, governance model.</div>
                </div>
              </details>
              <details className={styles.workItem}>
                <summary className={styles.workSummary}>
                  Placeholder Project Three
                  <span className={styles.workMeta}>2023 · AI tooling</span>
                </summary>
                <div className={styles.workContent}>
                  <div>Scope: workflow design and prototype testing.</div>
                  <div>Outcome: replace with a measurable result.</div>
                  <div>Artifacts: prototype, testing notes, rollout plan.</div>
                </div>
              </details>
            </div>
            <div className={styles.calloutRow}>
              <button
                className={styles.buttonSecondary}
                type="button"
                data-copy="/work-index"
                data-label="Copy work index link"
                aria-live="polite"
              >
                Copy work index link
              </button>
              <span className={styles.inlineCode}>/work-index</span>
            </div>
          </section>

          <section id="edge-cases" className={styles.section}>
            <h2 className={styles.sectionHeading}>Edge cases</h2>
            <p className={styles.sectionLead}>
              Not every request fits a single page. These routes are defined.
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>If a project is under NDA, request a redacted packet.</li>
              <li className={styles.listItem}>If you need process depth, ask for the research log.</li>
              <li className={styles.listItem}>If you need collaboration context, ask for references.</li>
            </ul>
          </section>

          <section id="rules-of-use" className={styles.section}>
            <h2 className={styles.sectionHeading}>Rules of use</h2>
            <p className={styles.sectionLead}>
              Treat this page as the source unless a section says otherwise.
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>Replace placeholders before sharing externally.</li>
              <li className={styles.listItem}>Keep headings unchanged so links stay valid.</li>
              <li className={styles.listItem}>Update outcomes with dates when numbers change.</li>
            </ul>
          </section>

          <section id="access-licensing" className={styles.section}>
            <h2 className={styles.sectionHeading}>Access & licensing</h2>
            <p className={styles.sectionLead}>
              Access is open. Licensing and usage can be set per request.
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>Resume PDF: replace with the real link.</li>
              <li className={styles.listItem}>Case studies: share with a direct URL.</li>
              <li className={styles.listItem}>Usage: add your preferred license text.</li>
            </ul>
            <div className={styles.divider} />
            <div className={styles.footerBlock}>
              <div>Contact: raf@domain.com</div>
              <div>Timezone: UTC-5 (placeholder)</div>
              <div>Location: replace with your location.</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
