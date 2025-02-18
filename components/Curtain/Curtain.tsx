import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface JapaneseCurtainProps {
  onAnimationComplete?: () => void;
}

const JapaneseCurtain = ({ onAnimationComplete }: JapaneseCurtainProps) => {
  const curtainRef = useRef<HTMLDivElement>(null);
  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Get current hour to adjust lighting
  const currentHour = new Date().getHours();
  const isDaytime = currentHour >= 6 && currentHour < 18;

  // Enhanced color palette with time-based adjustments
  const colors = {
    dark: {
      base: isDaytime ? "rgba(38, 35, 33, 0.98)" : "rgba(28, 26, 24, 0.98)",
      overlay: `rgba(209, 91, 5, ${isDaytime ? 0.05 : 0.03})`,
      pattern: `rgba(245, 234, 225, ${isDaytime ? 0.03 : 0.02})`,
      shadow: isDaytime
        ? "0 10px 30px rgba(0, 0, 0, 0.3)"
        : "0 10px 40px rgba(0, 0, 0, 0.4)",
      wave: `brightness(${isDaytime ? 0.94 : 0.92}) saturate(1.02)`,
    },
    light: {
      base: isDaytime
        ? "rgba(247, 244, 242, 0.98)"
        : "rgba(242, 239, 237, 0.98)",
      overlay: `rgba(209, 91, 5, ${isDaytime ? 0.03 : 0.02})`,
      pattern: `rgba(38, 35, 33, ${isDaytime ? 0.02 : 0.015})`,
      shadow: isDaytime
        ? "0 10px 30px rgba(0, 0, 0, 0.1)"
        : "0 10px 40px rgba(0, 0, 0, 0.15)",
      wave: `brightness(${isDaytime ? 0.97 : 0.96}) saturate(1.01)`,
    },
  };

  const theme = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    const curtain = curtainRef.current;
    if (!curtain) return;

    gsap.set(".curtain-panel", {
      x: 0,
      y: 0,
      opacity: 1,
      rotationY: 0,
      transformOrigin: "50% 50%",
    });

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        onAnimationComplete?.();
        curtain.remove();
      },
    });

    // Enhanced opening sequence
    tl.to(".curtain-panel", {
      duration: 0.6,
      scale: 1.01,
      filter: "brightness(1.02)",
      ease: "power2.inOut",
    })
      .to(".curtain-left", {
        x: "-105%",
        rotationY: -6,
        duration: 1.4,
        ease: "power2.inOut",
      })
      .to(
        ".curtain-right",
        {
          x: "105%",
          rotationY: 6,
          duration: 1.4,
          ease: "power2.inOut",
        },
        "<"
      )
      .to([".curtain-left", ".curtain-right"], {
        y: "150%",
        rotationX: 8,
        duration: 1,
        ease: "power1.in",
        stagger: { amount: 0.2 },
      });

    // Subtle wave animation
    gsap.to(".curtain-wave", {
      scaleY: 1.02,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => {
      tl.kill();
      gsap.killTweensOf(".curtain-wave");
    };
  }, [onAnimationComplete]);

  return (
    <div
      ref={curtainRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ perspective: "1800px" }}
    >
      <div className="relative w-full h-full overflow-hidden">
        {["-left", "-right"].map((side) => (
          <div
            key={side}
            className={`curtain-panel curtain${side} absolute top-0 ${
              side === "-left" ? "left-0" : "right-0"
            } w-1/2 h-full overflow-hidden transform-gpu`}
            style={{
              background: `linear-gradient(${
                side === "-left" ? "95deg" : "85deg"
              }, ${theme.base}, ${theme.base})`,
              boxShadow: `inset 0 0 100px ${theme.overlay}, ${theme.shadow}`,
            }}
          >
            {/* Enhanced grain texture */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    ${side === "-left" ? "45deg" : "-45deg"},
                    ${theme.pattern},
                    transparent 2px,
                    transparent 8px
                  ),
                  repeating-linear-gradient(
                    ${side === "-left" ? "-45deg" : "45deg"},
                    ${theme.pattern},
                    transparent 1px,
                    transparent 12px
                  )
                `,
                opacity: 0.5,
              }}
            />

            <div
              className="curtain-wave absolute bottom-0 w-full h-16"
              style={{
                background: theme.base,
                filter: theme.wave,
                boxShadow: `0 -10px 20px ${theme.overlay}`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default JapaneseCurtain;
