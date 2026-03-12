"use client";

/**
 * ============================================================================
 * HAPTICS DEMO - app/components/effects/HapticsDemo.tsx
 * ============================================================================
 *
 * Demo UI for the web-haptics library. Shows support status, built-in presets
 * (success, nudge, error, buzz), and a custom pattern. Optional debug mode
 * enables audio feedback on desktop where the Vibration API is unsupported.
 *
 * EXPORTS: HapticsDemo (default)
 * USAGE: Render on /haptics-demo or any client page. Haptics only fire on
 *        user gesture (button click). See docs/WEB_HAPTICS.md for full API.
 * Used by: app/haptics-demo/page.tsx
 */

import { useWebHaptics } from "web-haptics/react";
import { useState } from "react";

const PRESETS = [
  { id: "success" as const, label: "Success" },
  { id: "nudge" as const, label: "Nudge" },
  { id: "error" as const, label: "Error" },
  { id: "buzz" as const, label: "Buzz" },
];

export default function HapticsDemo() {
  const [debug, setDebug] = useState(false);
  const { trigger, isSupported: supported } = useWebHaptics({ debug });

  const handlePreset = (preset: "success" | "nudge" | "error" | "buzz") => {
    trigger(preset);
  };

  const handleCustom = () => {
    trigger([100, 50, 100]); // alternating on/off ms
  };

  return (
    <div className="mx-auto max-w-md space-y-6 px-6 py-10">
      <h1 className="font-edu-marist text-xl text-[var(--fg)]">
        Web Haptics demo
      </h1>
      <p className="type-body text-[var(--fg-muted)]">
        {supported
          ? "Tap a button to feel haptic feedback (or enable debug for audio on desktop)."
          : "Vibration API is not supported in this environment. Enable debug to hear a substitute sound on tap."}
      </p>

      <div className="flex flex-wrap gap-3">
        {PRESETS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => handlePreset(id)}
            className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm text-[var(--fg)] transition-colors hover:bg-[var(--fg-muted)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--fg)]/30"
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={handleCustom}
          className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm text-[var(--fg)] transition-colors hover:bg-[var(--fg-muted)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--fg)]/30"
        >
          Custom [100, 50, 100]
        </button>
      </div>

      <label className="flex cursor-pointer items-center gap-2 type-caption text-[var(--fg-muted)]">
        <input
          type="checkbox"
          checked={debug}
          onChange={(e) => setDebug(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)]"
        />
        Debug (audio on desktop when vibration unavailable)
      </label>
    </div>
  );
}
