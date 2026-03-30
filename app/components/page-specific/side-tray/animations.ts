import { EASING } from "@/components/animations/constants"

export const TRAY_BACKDROP_IN = 0.32
export const TRAY_BACKDROP_OUT = 0.32

export const backdropVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: TRAY_BACKDROP_IN,
      ease: EASING.smooth,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: TRAY_BACKDROP_OUT,
      ease: EASING.smooth,
    },
  },
} as const

export const trayVariants = {
  hidden: {
    x: "100%",
    scale: 0.992,
    rotateY: -2,
    opacity: 0,
  },
  visible: {
    x: 0,
    scale: 1,
    rotateY: 0,
    opacity: 1,
    transition: {
      x: {
        type: "spring" as const,
        stiffness: 195,
        damping: 30,
        mass: 1,
        duration: 0.62,
      },
      scale: {
        duration: 0.5,
        ease: EASING.gentle,
      },
      rotateY: {
        duration: 0.5,
        ease: EASING.smooth,
      },
      opacity: {
        duration: 0.32,
        ease: EASING.smooth,
      },
    },
  },
  exit: {
    x: "100%",
    scale: 0.992,
    rotateY: -2,
    opacity: 0,
    transition: {
      duration: 0.38,
      ease: EASING.smooth,
    },
  },
} as const

export const contentVariants = {
  hidden: {
    opacity: 0,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      opacity: {
        duration: 0.45,
        ease: EASING.smooth,
        delay: 0.22,
      },
      filter: {
        duration: 0.6,
        ease: EASING.gentle,
        delay: 0.22,
      },
    },
  },
  exit: {
    opacity: 0,
    filter: "blur(2px)",
    transition: {
      duration: 0.32,
      ease: EASING.smooth,
    },
  },
} as const

export const listItemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
    filter: "blur(4px)",
  },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: EASING.stagger,
      delay: i * 0.04,
      filter: {
        duration: 0.5,
        ease: EASING.gentle,
      },
    },
  }),
}

export const mobileListItemVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: EASING.smooth,
    },
  },
}

export const closeButtonVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      opacity: {
        duration: 0.5,
        ease: EASING.smooth,
        delay: 0.6,
      },
      scale: {
        duration: 0.5,
        ease: EASING.elastic,
        delay: 0.6,
      },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: EASING.smooth,
    },
  },
} as const

export const MOBILE_STACK_DURATION = 0.35
export const MOBILE_SHEET_SNAP_POINTS = [1, 0.64, 0] as const
export const MOBILE_SHEET_TWEEN = {
  ease: [0.23, 1, 0.32, 1],
  duration: 0.34,
} as const

export const mobileStackBackVariants = {
  single: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: MOBILE_STACK_DURATION, ease: EASING.smooth },
  },
  stacked: {
    opacity: 0.9,
    scale: 0.96,
    y: 8,
    transition: { duration: MOBILE_STACK_DURATION, ease: EASING.smooth },
  },
} as const

export const mobileStackFrontVariants = {
  hidden: {
    opacity: 0,
    y: "100%",
    transition: { duration: MOBILE_STACK_DURATION, ease: EASING.smooth },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOBILE_STACK_DURATION, ease: EASING.smooth },
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: { duration: MOBILE_STACK_DURATION, ease: EASING.smooth },
  },
} as const

export const viewTransitionVariants = {
  initial: {
    opacity: 0,
    filter: "blur(8px)",
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: EASING.smooth,
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    filter: "blur(4px)",
    transition: {
      duration: 0.25,
      ease: EASING.smooth,
    },
  },
} as const
