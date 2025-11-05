/**
 * ============================================================================
 * BLUEPRINT CONTENT COMPONENT
 * ============================================================================
 *
 * Renders the Blueprint content within the About modal.
 * Matches the structure and styling of AboutModalContent.
 */

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { modalTextStagger } from "@/components/animations/LoadingAnimations";

// ============================================================================
// TYPES
// ============================================================================

interface BlueprintSection {
  title: string;
  content: string[];
  items: string[];
}

interface ParsedBlueprint {
  title: string;
  sections: BlueprintSection[];
}

interface BlueprintContentProps {
  shouldReduceMotion?: boolean;
  onBack: () => void;
}

// ============================================================================
// CONTENT PARSING
// ============================================================================

/**
 * Parses the blueprint markdown content into structured data
 */
function parseBlueprint(content: string): ParsedBlueprint {
  const lines = content.split('\n');
  
  let title = "Blueprint";
  const sections: BlueprintSection[] = [];
  
  let currentSection: BlueprintSection | null = null;
  let currentContent: string[] = [];
  let currentItems: string[] = [];
  let foundTitle = false;
  
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    
    // Skip empty lines (but use them as context)
    if (line.length === 0) {
      continue;
    }
    
    // First non-empty line is title
    if (!foundTitle && line !== '⸻') {
      title = line;
      foundTitle = true;
      continue;
    }
    
    // Separator (⸻) - finalize current section
    if (line === '⸻') {
      if (currentSection) {
        currentSection.content = currentContent;
        currentSection.items = currentItems;
        sections.push(currentSection);
      }
      currentSection = null;
      currentContent = [];
      currentItems = [];
      continue;
    }
    
    // Check if this is a section header
    // Section headers are short title-case lines (not full sentences)
    // Preceded by empty line or separator
    const prevLine = i > 0 ? lines[i - 1].trim() : '';
    const prevPrevLine = i > 1 ? lines[i - 2].trim() : '';
    
    // Known section headers (exact matches)
    const knownSectionHeaders = [
      "Core Principles",
      "How I Work",
      "Notes about Design Approach",
      "Notes about Design Engineering"
    ];
    
    // Check if this is a known section header
    const isKnownHeader = knownSectionHeaders.includes(line);
    
    // If it's a known header, it's definitely a section header
    if (isKnownHeader && (prevLine === '' || prevLine === '⸻' || prevPrevLine === '⸻')) {
      // Save previous section if exists
      if (currentSection) {
        currentSection.content = currentContent;
        currentSection.items = currentItems;
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        title: line,
        content: [],
        items: []
      };
      currentContent = [];
      currentItems = [];
      continue;
    }
    
    // For unknown lines, check if they could be section headers
    // Section headers are typically:
    // - Short (under 40 chars)
    // - Title case (first letter uppercase)
    // - Not full sentences (no ending period, comma, or semicolon unless very short)
    // - Don't look like content paragraphs
    const isShortTitle = line.length < 40 && line.length > 0;
    const isTitleCase = line.length > 0 && 
      line[0] === line[0].toUpperCase() && 
      line[0] !== line[0].toLowerCase();
    
    // Check if it looks like a sentence/paragraph (has punctuation that suggests it's content)
    const hasEndingPunctuation = line.endsWith('.') || line.endsWith(',') || line.endsWith(';');
    const hasMiddlePunctuation = (line.includes(',') || line.includes(';')) && line.length > 20;
    const looksLikeSentence = hasEndingPunctuation || hasMiddlePunctuation;
    
    // Section headers are typically 2-5 words, not full sentences
    const wordCount = line.split(/\s+/).length;
    const looksLikeTitle = wordCount >= 2 && wordCount <= 6 && !looksLikeSentence;
    
    const isSectionHeader = 
      !isKnownHeader && // Not already handled above
      line.length > 0 && 
      !line.startsWith('•') && 
      !line.includes('•') &&
      isTitleCase &&
      isShortTitle &&
      looksLikeTitle && // Looks like a title, not a sentence
      (prevLine === '' || prevLine === '⸻' || prevPrevLine === '⸻');
    
    // Handle unknown section headers (if any)
    if (isSectionHeader) {
      // Save previous section if exists
      if (currentSection) {
        currentSection.content = currentContent;
        currentSection.items = currentItems;
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        title: line,
        content: [],
        items: []
      };
      currentContent = [];
      currentItems = [];
      continue;
    }
    
    // Bullet point (handles both "•" and tab-indented "•")
    const hasBullet = line.includes('•');
    const isTabIndented = rawLine.startsWith('\t') || rawLine.startsWith('  ');
    
    if (hasBullet && (line.startsWith('•') || isTabIndented)) {
      // Extract text after bullet (handle tab + bullet or just bullet)
      const itemText = line
        .replace(/^\s*/, '') // Remove leading whitespace
        .replace(/^•\s*/, '') // Remove bullet and space after
        .replace(/^\t*/, '') // Remove any remaining tabs
        .trim();
      
      if (itemText && currentSection) {
        currentItems.push(itemText);
      }
      continue;
    }
    
    // Regular content (paragraph text) - only if we have a current section
    if (line && currentSection && !hasBullet) {
      currentContent.push(line);
    }
  }
  
  // Save last section
  if (currentSection) {
    currentSection.content = currentContent;
    currentSection.items = currentItems;
    sections.push(currentSection);
  }
  
  // Filter out Core Principles section
  const filteredSections = sections.filter(section => section.title !== "Core Principles");
  
  return { title, sections: filteredSections };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BlueprintContent({
  shouldReduceMotion: _shouldReduceMotion = false,
  onBack,
}: BlueprintContentProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Parse content when loaded
  const parsedContent = useMemo(() => {
    if (!content) return null;
    try {
      return parseBlueprint(content);
    } catch (err) {
      console.error('Error parsing blueprint:', err);
      return null;
    }
  }, [content]);
  
  // Fetch blueprint content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Add cache-busting query parameter and no-cache headers
        const response = await fetch(`/documents/blueprint.md?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to load blueprint: ${response.status}`);
        }
        
        const text = await response.text();
        setContent(text);
      } catch (err) {
        console.error('Error loading blueprint:', err);
        setError(err instanceof Error ? err.message : 'Failed to load blueprint');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, []);
  
  if (isLoading) {
    return (
      <motion.div 
        className="text-center py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <p className="text-sm text-foreground/50">Loading blueprint...</p>
      </motion.div>
    );
  }
  
  if (error) {
    return (
      <motion.div 
        className="text-center py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <p className="text-sm text-foreground/70 mb-2">Unable to load blueprint</p>
        <p className="text-xs text-foreground/50">{error}</p>
      </motion.div>
    );
  }
  
  if (!parsedContent || parsedContent.sections.length === 0) {
    return (
      <motion.div 
        className="text-center py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <p className="text-sm text-foreground/70">No sections found in blueprint</p>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="text-left text-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back button */}
      <motion.span
        onClick={onBack}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onBack();
          }
        }}
        className="mb-6 text-xs tracking-wider text-foreground/40 hover:text-foreground/80 cursor-pointer underline decoration-foreground/20 hover:decoration-foreground/50 underline-offset-2 px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-sm hover:bg-foreground/5 transition-all duration-200 font-medium inline-block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.85 }}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        ← Back
      </motion.span>
      
      {/* Content */}
      <motion.div
        variants={{
          hidden: { opacity: 1 },
          visible: {
            opacity: 1,
            transition: { 
              staggerChildren: 0.15, 
              delayChildren: 0.7 
            },
          },
          exit: {
            opacity: 1,
            transition: { staggerChildren: 0.05, staggerDirection: -1 },
          },
        }}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex flex-col md:flex-row md:gap-6 space-y-6 md:space-y-0"
      >
        {/* Sections - reversed order for stagger animation (third, second, first) */}
        {[...parsedContent.sections].reverse().map((section, reversedIndex) => {
          const sectionIndex = parsedContent.sections.length - 1 - reversedIndex;
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
                  {/* Content Paragraphs */}
                  {section.content.length > 0 && (
                    <div className="space-y-4">
                      {section.content.map((paragraph, paraIndex) => (
                        <p
                          key={paraIndex}
                          className="leading-[1.6] text-sm text-foreground/70"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* List Items - pushed to bottom, rendered as paragraphs */}
                {section.items.length > 0 && (
                  <div className="mt-auto space-y-3 pt-5">
                    {section.items.map((item, itemIndex) => (
                      <p
                        key={itemIndex}
                        className="leading-[1.6] text-sm text-foreground/70"
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                )}
              </motion.div>
              
              {/* Divider between sections (not after last section) */}
              {reversedIndex < parsedContent.sections.length - 1 && (
                <motion.div
                  variants={modalTextStagger.item}
                  className="md:w-px md:h-auto h-px w-full bg-foreground/10"
                />
              )}
            </React.Fragment>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

