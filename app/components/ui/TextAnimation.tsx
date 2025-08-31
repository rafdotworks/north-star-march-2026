"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  StaggeredTextContainer,
  StaggeredTextItem,
  CharacterReveal,
  WordReveal,
  PhraseReveal,
  EnhancedStaggeredTextContainer,
  EnhancedStaggeredTextItem,
  EASING,
} from "@/components/animations/LoadingAnimations";

interface TextAnimationProps {
  textLoaded: boolean;
  isMobile?: boolean;
}

export const TextAnimation: React.FC<TextAnimationProps> = ({
  textLoaded,
  isMobile = false,
}) => {
  const phrases = [
    "Raf leads as a Senior Designer and Design Engineer",
    "Now in stealth in Toronto",
    "Past at Coinbase, VoiceFlow, Theoriq & more",
    "raf@raf.works",
  ];

  if (isMobile) {
    return (
      <div className="w-full mb-36 block sm:hidden">
        <div className="space-y-8">
          <section className="w-full">
            <div className="space-y-8">
              <div className="space-y-6">
                {textLoaded ? (
                  <EnhancedStaggeredTextContainer staggerDelay={0.15}>
                    <EnhancedStaggeredTextItem>
                      <div className="tracking-tight text-lg md:whitespace-nowrap">
                        <WordReveal
                          text="Raf leads as a Senior Designer and Design Engineer."
                          className="text-foreground/70"
                        />
                      </div>
                    </EnhancedStaggeredTextItem>

                    <EnhancedStaggeredTextItem>
                      <div className="h-4"></div>
                    </EnhancedStaggeredTextItem>

                    <EnhancedStaggeredTextItem>
                      <WordReveal
                        text="Now building in stealth Toronto. Past at Coinbase, VoiceFlow, Theoriq & more"
                        className="text-foreground/70 tracking-tight text-lg md:whitespace-nowrap"
                      />
                    </EnhancedStaggeredTextItem>

                    <EnhancedStaggeredTextItem>
                      <div className="h-4"></div>
                    </EnhancedStaggeredTextItem>

                    <EnhancedStaggeredTextItem>
                      <a
                        href="mailto:raf@raf.works"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground/70 hover:text-foreground transition-colors tracking-tight text-lg"
                      >
                        <WordReveal text="raf@raf.works" />
                      </a>
                    </EnhancedStaggeredTextItem>
                  </EnhancedStaggeredTextContainer>
                ) : (
                  <motion.p
                    className="tracking-tight text-lg"
                    initial={{
                      opacity: 0,
                      filter: "blur(25px)",
                      y: 30,
                      scale: 0.98,
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                      scale: 1,
                    }}
                    transition={{
                      duration: 1.8,
                      ease: EASING.textReveal,
                    }}
                  >
                    <motion.span
                      className="text-foreground/70"
                      initial={{
                        opacity: 0,
                        filter: "blur(25px)",
                        y: 25,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        duration: 1.6,
                        ease: EASING.textReveal,
                      }}
                    >
                      Raf leads as a{" "}
                    </motion.span>
                    <motion.span
                      className="text-foreground font-medium"
                      initial={{
                        opacity: 0,
                        filter: "blur(25px)",
                        y: 25,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        duration: 1.6,
                        ease: EASING.textReveal,
                      }}
                    >
                      Senior Designer
                    </motion.span>
                    <motion.span
                      className="text-foreground/70"
                      initial={{
                        opacity: 0,
                        filter: "blur(25px)",
                        y: 25,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        duration: 1.6,
                        ease: EASING.textReveal,
                      }}
                    >
                      {" "}
                      and{" "}
                    </motion.span>
                    <motion.span
                      className="text-foreground font-medium"
                      initial={{
                        opacity: 0,
                        filter: "blur(25px)",
                        y: 25,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        duration: 1.6,
                        ease: EASING.textReveal,
                      }}
                    >
                      Design Engineer
                    </motion.span>
                    <motion.span
                      className="text-foreground/70"
                      initial={{
                        opacity: 0,
                        filter: "blur(25px)",
                        y: 25,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        duration: 1.6,
                        ease: EASING.textReveal,
                      }}
                    >
                      .
                    </motion.span>
                    <div className="h-4"></div>
                    <motion.span
                      className="text-foreground/70"
                      initial={{
                        opacity: 0,
                        filter: "blur(25px)",
                        y: 25,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        duration: 1.6,
                        ease: EASING.textReveal,
                      }}
                    >
                      Now building in stealth in Toronto.
                    </motion.span>
                    <br />
                    <motion.span
                      className="text-foreground/70"
                      initial={{
                        opacity: 0,
                        filter: "blur(25px)",
                        y: 25,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        duration: 1.6,
                        ease: EASING.textReveal,
                      }}
                    >
                      Past at Coinbase, VoiceFlow, Theoriq & more
                    </motion.span>
                    <div className="h-4"></div>
                    <motion.span
                      className="text-foreground/70"
                      initial={{
                        opacity: 0,
                        filter: "blur(25px)",
                        y: 25,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        duration: 1.6,
                        ease: EASING.textReveal,
                      }}
                    >
                      <a
                        href="https://www.linkedin.com/in/raffaelevitaledesign"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors"
                      >
                        Text anytime
                      </a>
                    </motion.span>
                  </motion.p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full hidden sm:block">
      <div className="space-y-8">
        <section className="w-full">
          <div className="space-y-8">
            <div className="space-y-6">
              {textLoaded && (
                <EnhancedStaggeredTextContainer staggerDelay={0.12}>
                  <EnhancedStaggeredTextItem>
                    <div className="tracking-tight text-lg md:whitespace-nowrap">
                      <WordReveal
                        text="Raf leads as a Senior Designer and Design Engineer."
                        className="text-foreground/70"
                      />
                    </div>
                  </EnhancedStaggeredTextItem>

                  <EnhancedStaggeredTextItem>
                    <div className="h-4"></div>
                  </EnhancedStaggeredTextItem>

                  <EnhancedStaggeredTextItem>
                    <WordReveal
                      text="Now building in stealth Toronto. Past at Coinbase, VoiceFlow, Theoriq & more"
                      className="text-foreground/70 tracking-tight text-lg md:whitespace-nowrap"
                    />
                  </EnhancedStaggeredTextItem>

                  <EnhancedStaggeredTextItem>
                    <div className="h-4"></div>
                  </EnhancedStaggeredTextItem>

                  <EnhancedStaggeredTextItem>
                    <a
                      href="https://www.linkedin.com/in/raffaelevitaledesign"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/70 hover:text-foreground transition-colors tracking-tight text-lg"
                    >
                      <WordReveal text="Text anytime" />
                    </a>
                  </EnhancedStaggeredTextItem>
                </EnhancedStaggeredTextContainer>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
