/**
 * ============================================================================
 * ABOUT MODAL CONTENT COMPONENT
 * ============================================================================
 *
 * Renders the About Raf modal content using localized copy.
 * Separates content structure from presentation logic.
 */

import React from "react";
import { motion } from "framer-motion";
import { modalTextStagger } from "@/components/animations/LoadingAnimations";
import { ABOUT_MODAL_CONTENT } from "@/app/config/aboutModalConfig";

interface AboutModalContentProps {
  shouldReduceMotion?: boolean;
  onBlueprintClick?: () => void;
}

/**
 * Parses HTML string and converts to React elements
 */
function parseHTMLToReact(htmlString: string, startKey: number): (string | React.ReactElement)[] {
  const parts: (string | React.ReactElement)[] = [];
  const htmlRegex = /<span class="([^"]+)">([^<]+)<\/span>/g;
  let lastIndex = 0;
  let match;
  let spanCounter = 0;

  while ((match = htmlRegex.exec(htmlString)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = htmlString.slice(lastIndex, match.index);
      if (beforeText.length > 0) {
        parts.push(beforeText);
      }
    }

    // Add the span element
    const className = match[1];
    const content = match[2];
    parts.push(
      <span key={`span-${startKey}-${spanCounter++}`} className={className}>
        {content}
      </span>
    );

    lastIndex = htmlRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < htmlString.length) {
    const remainingText = htmlString.slice(lastIndex);
    if (remainingText.length > 0) {
      parts.push(remainingText);
    }
  }

  return parts.length > 0 ? parts : [htmlString];
}

/**
 * Renders a paragraph from the modal content with proper formatting
 */
function renderParagraph(
  paragraph: { text: string; isHighlighted?: boolean; isEmphasized?: boolean },
  links: typeof ABOUT_MODAL_CONTENT.contactLinks,
  index: number,
  key: string | number
) {
  const { text, isHighlighted, isEmphasized } = paragraph;

  // First, parse HTML elements
  const htmlParts = parseHTMLToReact(text, index);

  // Then, handle link placeholders within each part
  const parts: (string | React.ReactElement)[] = [];
  let linkCounter = 0;

  htmlParts.forEach((part, partIndex) => {
    if (typeof part === 'string') {
      // Process link placeholders in text parts
      const linkRegex = /\{(linkedin|x|email|blueprint)\}/g;
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(part)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          const beforeText = part.slice(lastIndex, match.index);
          if (beforeText.length > 0) {
            parts.push(beforeText);
          }
        }

        // Add the link component
        const linkKey = match[1] as "linkedin" | "x" | "email" | "blueprint";
        const link = links[linkKey];
        const isExternalLink = linkKey !== "email" && linkKey !== "blueprint";
        parts.push(
          <a
            key={`link-${index}-${linkCounter++}`}
            href={link.href}
            target={isExternalLink ? "_blank" : undefined}
            rel={isExternalLink ? "noopener noreferrer" : undefined}
            className="text-foreground/85 underline hover:text-foreground transition-colors"
          >
            {link.label}
          </a>
        );

        lastIndex = linkRegex.lastIndex;
      }

      // Add remaining text
      if (lastIndex < part.length) {
        const remainingText = part.slice(lastIndex);
        if (remainingText.length > 0) {
          parts.push(remainingText);
        }
      } else if (lastIndex === 0) {
        // No links found, add the original part
        parts.push(part);
      }
    } else {
      // Add React elements as-is
      parts.push(React.cloneElement(part, { key: `part-${index}-${partIndex}` }));
    }
  });

  // If no processing was done, use the original text
  const content = parts.length > 0 ? parts : text;

  const className = isHighlighted
    ? "leading-[1.6] text-sm text-foreground/85 font-medium md:h-24"
    : "leading-[1.6] text-sm text-foreground/70";

  if (isEmphasized) {
    return <em key={key} className={className}>{content}</em>;
  }

  return <p key={key} className={className}>{content}</p>;
}

/**
 * AboutModalContent component
 * Renders all sections of the About Raf modal
 */
export function AboutModalContent({
  shouldReduceMotion: _shouldReduceMotion = false,
  onBlueprintClick,
}: AboutModalContentProps) {
  return (
    <motion.div
      variants={modalTextStagger.container}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="text-left text-foreground flex flex-col md:flex-row md:gap-6 space-y-6 md:space-y-0"
    >
      {ABOUT_MODAL_CONTENT.sections.map((section, sectionIndex) => {
        // Separate highlighted paragraphs from regular ones
        const highlightedParagraphs = section.paragraphs.filter(
          (p) => p.isHighlighted
        );
        const regularParagraphs = section.paragraphs.filter(
          (p) => !p.isHighlighted
        );

        return (
          <React.Fragment key={section.title}>
            <motion.div
              variants={modalTextStagger.item}
              className="flex-1 flex flex-col"
            >
              <div className="space-y-5">
                <h3 className="text-[10px] uppercase tracking-wider text-foreground/85 font-medium">
                  {section.title}
                </h3>
                {/* Render highlighted paragraphs at the top */}
                {highlightedParagraphs.map((paragraph, paraIndex) =>
                  renderParagraph(
                    paragraph,
                    ABOUT_MODAL_CONTENT.contactLinks,
                    sectionIndex * 100 + paraIndex,
                    `highlighted-${sectionIndex}-${paraIndex}`
                  )
                )}
              </div>
              {/* Regular content container - pushed to bottom with mt-auto */}
              <div className="mt-auto space-y-3 pt-5">
                {regularParagraphs.map((paragraph, paraIndex) =>
                  renderParagraph(
                    paragraph,
                    ABOUT_MODAL_CONTENT.contactLinks,
                    sectionIndex * 100 + highlightedParagraphs.length + paraIndex,
                    `regular-${sectionIndex}-${paraIndex}`
                  )
                )}

                {/* Render principles list for the Principles section */}
                {section.title === "Principles" && (
                  <>
                    {ABOUT_MODAL_CONTENT.principles.map((principle, index) => (
                      <p key={index} className="leading-[1.6] text-sm text-foreground/70">
                        {principle}
                      </p>
                    ))}
                    <p className="text-sm text-foreground/70 leading-[1.6] mt-3">
                      Read my{" "}
                      {onBlueprintClick ? (
                        <span
                          onClick={onBlueprintClick}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onBlueprintClick();
                            }
                          }}
                          className="text-foreground cursor-pointer underline decoration-foreground/20 hover:decoration-foreground/50 underline-offset-2 px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-sm hover:bg-foreground/5 transition-all duration-200 inline-block"
                          style={{ 
                            WebkitTapHighlightColor: 'transparent'
                          }}
                        >
                          {ABOUT_MODAL_CONTENT.contactLinks.blueprint.label}
                        </span>
                      ) : (
                        <a
                          href={ABOUT_MODAL_CONTENT.contactLinks.blueprint.href}
                          className="text-foreground/85 underline hover:text-foreground transition-colors"
                        >
                          {ABOUT_MODAL_CONTENT.contactLinks.blueprint.label}
                        </a>
                      )}
                      .
                    </p>
                  </>
                )}
              </div>
            </motion.div>

            {/* Render divider between sections (not after last section) */}
            {sectionIndex < ABOUT_MODAL_CONTENT.sections.length - 1 && (
              <motion.div
                variants={modalTextStagger.item}
                className="md:w-px md:h-auto h-px w-full bg-foreground/10"
              />
            )}
          </React.Fragment>
        );
      })}
    </motion.div>
  );
}

