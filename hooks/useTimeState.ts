import { useState, useEffect } from "react";

type TimeOfDay = "dawn" | "morning" | "afternoon" | "evening" | "night";

interface TimeState {
  hour: number;
  minute: number;
  timeOfDay: TimeOfDay;
  progress: number;
}

const getTimeOfDay = (hour: number): TimeOfDay => {
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
};

const calculateProgress = (hour: number, minute: number, timeOfDay: TimeOfDay): number => {
  let progress = 0;

  switch (timeOfDay) {
    case "dawn":
      progress = ((hour - 5) * 60 + minute) / (3 * 60);
      break;
    case "morning":
      progress = ((hour - 8) * 60 + minute) / (4 * 60);
      break;
    case "afternoon":
      progress = ((hour - 12) * 60 + minute) / (5 * 60);
      break;
    case "evening":
      progress = ((hour - 17) * 60 + minute) / (4 * 60);
      break;
    case "night":
      if (hour >= 21) {
        progress = ((hour - 21) * 60 + minute) / (8 * 60);
      } else {
        progress = ((hour + 3) * 60 + minute) / (8 * 60);
      }
      break;
  }

  return Math.max(0, Math.min(1, progress));
};

const isDST = (now: Date): boolean => {
  const jan = new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(now.getFullYear(), 6, 1).getTimezoneOffset();
  return Math.max(jan, jul) !== now.getTimezoneOffset();
};

export function useTimeState() {
  const [timeState, setTimeState] = useState<TimeState>(() => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeOfDay = getTimeOfDay(hour);
    
    return {
      hour,
      minute,
      timeOfDay,
      progress: calculateProgress(hour, minute, timeOfDay),
    };
  });

  const updateTimeState = () => {
    const now = new Date();
    const estOffset = -5;

    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const estTime = new Date(utc + 3600000 * (estOffset + (isDST(now) ? 1 : 0)));

    const hour = estTime.getHours();
    const minute = estTime.getMinutes();
    const timeOfDay = getTimeOfDay(hour);
    const progress = calculateProgress(hour, minute, timeOfDay);

    setTimeState({
      hour,
      minute,
      timeOfDay,
      progress,
    });
  };

  const formatTime = (): string => {
    const { hour, minute } = timeState;
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    const displayMinute = minute < 10 ? `0${minute}` : minute;

    return `${displayHour}:${displayMinute} ${period} EST`;
  };

  const getTimeDifference = (isMobile: boolean = false): string => {
    const localDate = new Date();

    const estOptions = {
      timeZone: "America/New_York",
      hour: "numeric" as const,
      minute: "numeric" as const,
      hour12: false,
    };
    const estHour = parseInt(
      new Intl.DateTimeFormat("en-US", estOptions).format(localDate)
    );

    const localOptions = { hour: "numeric" as const, hour12: false };
    const localHour = parseInt(
      new Intl.DateTimeFormat("en-US", localOptions).format(localDate)
    );

    let hourDifference = localHour - estHour;

    if (hourDifference > 12) {
      hourDifference -= 24;
    } else if (hourDifference < -12) {
      hourDifference += 24;
    }

    if (hourDifference === 0) {
      return "Same timezone as Raf";
    } else if (hourDifference > 0) {
      return `Raf is ${hourDifference}h behind`;
    } else {
      return `Raf is ${Math.abs(hourDifference)}h ahead`;
    }
  };

  useEffect(() => {
    updateTimeState();
    const interval = setInterval(updateTimeState, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    timeState,
    formatTime,
    getTimeDifference,
    updateTimeState,
  };
}