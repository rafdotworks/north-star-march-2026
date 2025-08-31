"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  StaggeredTextContainer,
  StaggeredTextItem,
} from "@/components/animations/LoadingAnimations";

interface TextAnimationProps {
  textLoaded: boolean;
  isMobile?: boolean;
}

export const TextAnimation: React.FC<TextAnimationProps> = ({
  textLoaded,
  isMobile = false,
}) => {
  const textContent = (
    <p className="tracking-tight text-lg">
      <span className="text-foreground/70">Raf leads as a </span>
      <span className="text-foreground font-medium">Senior Designer</span>
      <span className="text-foreground/70"> and </span>
      <span className="text-foreground font-medium">Design Engineer</span>
      <span className="text-foreground/70">.</span>
      <div className="h-4"></div>
      <span className="text-foreground/70">
        Now building in stealth with Berachain in Toronto in person
      </span>
      <br />
      <span className="text-foreground/70">
        Past at Coinbase, VoiceFlow, Theoriq & more
      </span>
      <div className="h-4"></div>
      <span className="text-foreground/70">
        <a
          href="https://www.linkedin.com/in/raffaelevitaledesign"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Text anytime
        </a>
      </span>
    </p>
  );

  if (isMobile) {
    return (
      <div className="w-full mb-36 block sm:hidden">
        <div className="space-y-8">
          <section className="w-full">
            <div className="space-y-8">
              <div className="space-y-6">
                {textLoaded ? (
                  <StaggeredTextContainer>
                    <StaggeredTextItem>{textContent}</StaggeredTextItem>
                  </StaggeredTextContainer>
                ) : (
                  <motion.p
                    className="tracking-tight text-lg"
                    initial={{ opacity: 0, filter: "blur(20px)", y: 20 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    transition={{
                      duration: 1.2,
                      ease: [0.12, 1, 0.28, 1],
                    }}
                  >
                    <motion.span
                      className="text-foreground/70"
                      initial={{
                        opacity: 0,
                        filter: "blur(20px)",
                        y: 20,
                      }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      transition={{
                        duration: 1.2,
                        ease: [0.12, 1, 0.28, 1],
                      }}
                    >
                      Raf leads as a{" "}
                    </motion.span>
                    <motion.span
                      className="text-foreground font-medium"
                      initial={{
                        opacity: 0,
                        filter: "blur(20px)",
                        y: 20,
                      }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      transition={{
                        duration: 1.2,
                        ease: [0.12, 1, 0.28, 1],
                      }}
                    >
                      Senior Designer
                    </motion.span>
                    <motion.span
                      className="text-foreground/70"
                      initial={{
                        opacity: 0,
                        filter: "blur(20px)",
                        y: 20,
                      }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      transition={{
                        duration: 1.2,
                        ease: [0.12, 1, 0.28, 1],
                      }}
                    >
                      {" "}
                      and{" "}
                    </motion.span>
                    <motion.span
                      className="text-foreground font-medium"
                      initial={{
                        opacity: 0,
                        filter: "blur(20px)",
                        y: 20,
                      }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      transition={{
                        duration: 1.2,
                        ease: [0.12, 1, 0.28, 1],
                      }}
                    >
                      Design Engineer
                    </motion.span>
                    <motion.span
                      className="text-foreground/70"
                      initial={{
                        opacity: 0,
                        filter: "blur(20px)",
                        y: 20,
                      }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      transition={{
                        duration: 1.2,
                        ease: [0.12, 1, 0.28, 1],
                      }}
                    >
                      .
                    </motion.span>
                    <div className="h-4"></div>
                    <motion.span
                      className="text-foreground/70"
                      initial={{
                        opacity: 0,
                        filter: "blur(20px)",
                        y: 20,
                      }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      transition={{
                        duration: 1.2,
                        ease: [0.12, 1, 0.28, 1],
                      }}
                    >
                      Now building in stealth with Berachain in Toronto in
                      person
                    </motion.span>
                    <br />
                    <motion.span
                      className="text-foreground/70"
                      initial={{
                        opacity: 0,
                        filter: "blur(20px)",
                        y: 20,
                      }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      transition={{
                        duration: 1.2,
                        ease: [0.12, 1, 0.28, 1],
                      }}
                    >
                      Past at Coinbase, VoiceFlow, Theoriq & more
                    </motion.span>
                    <div className="h-4"></div>
                    <motion.span
                      className="text-foreground/70"
                      initial={{
                        opacity: 0,
                        filter: "blur(20px)",
                        y: 20,
                      }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      transition={{
                        duration: 1.2,
                        ease: [0.12, 1, 0.28, 1],
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
                <StaggeredTextContainer>
                  <StaggeredTextItem>{textContent}</StaggeredTextItem>
                </StaggeredTextContainer>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
