"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CharacterReveal,
  WordReveal,
  PhraseReveal,
  EnhancedStaggeredTextContainer,
  EnhancedStaggeredTextItem,
  TextReveal,
  EASING,
} from "@/components/animations/LoadingAnimations";

export default function TextAnimationDemo() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const phrases = [
    "Welcome to the enhanced text animation demo.",
    "Each animation type offers a unique reveal experience.",
    "From character-by-character to phrase-by-phrase reveals.",
    "Creating smooth, polished cascading effects.",
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASING.textReveal }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Enhanced Text Animations
          </h1>
          <p className="text-foreground/70 text-lg">
            Smooth blur-to-focus effects with sophisticated timing
          </p>
        </motion.div>

        {/* Character-by-Character Reveal */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Character-by-Character Reveal
          </h2>
          <div className="p-6 bg-foreground/5 rounded-lg">
            {isLoaded && (
              <CharacterReveal
                text="This text appears character by character with a smooth blur-to-focus effect."
                className="text-lg text-foreground/80"
              />
            )}
          </div>
        </section>

        {/* Word-by-Word Reveal */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Word-by-Word Reveal
          </h2>
          <div className="p-6 bg-foreground/5 rounded-lg">
            {isLoaded && (
              <WordReveal
                text="Each word appears individually creating a natural reading flow."
                className="text-lg text-foreground/80"
              />
            )}
          </div>
        </section>

        {/* Phrase-by-Phrase Reveal */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Phrase-by-Phrase Reveal
          </h2>
          <div className="p-6 bg-foreground/5 rounded-lg">
            {isLoaded && (
              <PhraseReveal
                phrases={phrases}
                className="text-lg text-foreground/80"
              />
            )}
          </div>
        </section>

        {/* Enhanced Staggered Text */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Enhanced Staggered Text
          </h2>
          <div className="p-6 bg-foreground/5 rounded-lg">
            {isLoaded && (
              <EnhancedStaggeredTextContainer staggerDelay={0.15}>
                <EnhancedStaggeredTextItem>
                  <p className="text-lg text-foreground/80">
                    <span className="text-foreground/70">Enhanced with </span>
                    <span className="text-foreground font-medium">scale</span>
                    <span className="text-foreground/70"> and </span>
                    <span className="text-foreground font-medium">blur</span>
                    <span className="text-foreground/70"> effects.</span>
                  </p>
                </EnhancedStaggeredTextItem>
                <EnhancedStaggeredTextItem>
                  <p className="text-lg text-foreground/80 mt-4">
                    <span className="text-foreground/70">Smooth </span>
                    <span className="text-foreground font-medium">
                      cascading
                    </span>
                    <span className="text-foreground/70">
                      {" "}
                      animations with{" "}
                    </span>
                    <span className="text-foreground font-medium">
                      sophisticated
                    </span>
                    <span className="text-foreground/70"> timing.</span>
                  </p>
                </EnhancedStaggeredTextItem>
              </EnhancedStaggeredTextContainer>
            )}
          </div>
        </section>

        {/* Mixed Animation Types */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Mixed Animation Types
          </h2>
          <div className="p-6 bg-foreground/5 rounded-lg space-y-4">
            {isLoaded && (
              <>
                <WordReveal
                  text="Combine different animation types for variety."
                  className="text-lg text-foreground/80"
                />
                <CharacterReveal
                  text="Character reveals for emphasis."
                  className="text-lg text-foreground/60"
                />
                <TextReveal delay={0.5}>
                  <p className="text-lg text-foreground/80">
                    Classic text reveal for larger blocks.
                  </p>
                </TextReveal>
              </>
            )}
          </div>
        </section>

        {/* Animation Controls */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Animation Controls
          </h2>
          <div className="p-6 bg-foreground/5 rounded-lg">
            <button
              onClick={() => setIsLoaded(!isLoaded)}
              className="px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
            >
              {isLoaded ? "Reset Animations" : "Start Animations"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
