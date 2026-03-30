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
import { MINIMAL_TEXT_LINK_CLASSES } from "@/app/components/layout/InlineExternalLink";

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
  links: typeof ABOUT_MODAL_CONTENT.contactLinks & typeof ABOUT_MODAL_CONTENT.companyLinks,
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
      const linkRegex = /\{(linkedin|x|email|blueprint|walmart|theoriq|coinbase|voiceflow|zalando|write|photograph)\}/g;
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
        const tokenKey = match[1] as "linkedin" | "x" | "email" | "blueprint" | "walmart" | "theoriq" | "coinbase" | "voiceflow" | "zalando" | "write" | "photograph";

        if (tokenKey === "write" || tokenKey === "photograph") {
          parts.push(tokenKey);
        } else {
          const link = links[tokenKey];
          const isExternalLink = link.href.startsWith("http");
          parts.push(
            <a
              key={`link-${index}-${linkCounter++}`}
              href={link.href}
              target={isExternalLink ? "_blank" : undefined}
              rel={isExternalLink ? "noopener noreferrer" : undefined}
              className={MINIMAL_TEXT_LINK_CLASSES}
            >
              {link.label}
            </a>
          );
        }

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
  // Prop reserved for future reduced-motion support in modal animations
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shouldReduceMotion: _shouldReduceMotion = false,
  onBlueprintClick,
}: AboutModalContentProps) {
  const modalLinks = {
    ...ABOUT_MODAL_CONTENT.contactLinks,
    ...ABOUT_MODAL_CONTENT.companyLinks,
  };

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
                    modalLinks,
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
                    modalLinks,
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
                          className={`${MINIMAL_TEXT_LINK_CLASSES} inline-block`}
                          style={{ 
                            WebkitTapHighlightColor: 'transparent'
                          }}
                        >
                          {ABOUT_MODAL_CONTENT.contactLinks.blueprint.label}
                        </span>
                      ) : (
                        <a
                          href={ABOUT_MODAL_CONTENT.contactLinks.blueprint.href}
                          className={MINIMAL_TEXT_LINK_CLASSES}
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
