# Web Haptics

Haptic feedback for the mobile web using the [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API). This project uses the [web-haptics](https://www.npmjs.com/package/web-haptics) package (by Lochie Axon).

- **npm**: [web-haptics](https://www.npmjs.com/package/web-haptics)
- **Demo**: [/haptics-demo](/haptics-demo) (run the app and open that route)

## Install

```bash
npm i web-haptics
```

## Usage in this app

We use the **React** integration. In any client component:

```tsx
"use client";

import { useWebHaptics } from "web-haptics/react";

function MyComponent() {
  const { trigger, cancel, isSupported } = useWebHaptics();

  return (
    <button
      type="button"
      onClick={() => trigger("success")}
      disabled={!isSupported}
    >
      Confirm
    </button>
  );
}
```

Optional options for the hook (e.g. for development on desktop):

```tsx
const { trigger } = useWebHaptics({ debug: true }); // audio fallback when vibration unavailable
```

## Built-in presets

| Preset   | Description                          |
|----------|--------------------------------------|
| `success`| Two taps indicating success          |
| `nudge`  | Strong tap followed by a soft tap    |
| `error`  | Three sharp taps for errors          |
| `buzz`   | Long vibration                       |

Trigger by name: `trigger("success")`, `trigger("nudge")`, etc.

## Custom patterns

```ts
// Alternating on/off durations (ms)
trigger([100, 50, 100]);

// Single vibration (ms)
trigger(200);

// Full pattern with duration and optional intensity/delay
trigger([
  { duration: 80, intensity: 0.8 },
  { delay: 50, duration: 100 },
]);

// Override intensity (0–1) for a preset
trigger("success", { intensity: 0.8 });
```

## API summary

- **`useWebHaptics(options?)`** (React)  
  Returns `{ trigger, cancel, isSupported }`.  
  Options: `{ debug?: boolean, showSwitch?: boolean }`.

- **`trigger(input?, options?)`**  
  `input`: preset name (`"success"` | `"nudge"` | `"error"` | `"buzz"`), duration in ms, `number[]`, `Vibration[]`, or `HapticPreset`.  
  `options.intensity`: 0–1 override.

- **`cancel()`**  
  Stops the current pattern.

- **`WebHaptics.isSupported`** (static)  
  `true` if the device supports the Vibration API. Use for feature detection.

**Vanilla (no framework):**

```ts
import { WebHaptics } from "web-haptics";

const haptics = new WebHaptics({ debug: true });
haptics.trigger("success");
// haptics.cancel();
// haptics.destroy();
```

## Support and behavior

- **Supported**: Android Chrome and many mobile browsers that implement the Vibration API. Desktop browsers typically do not support vibration.
- **Feature detection**: Check `WebHaptics.isSupported` (or `isSupported` from the hook) before relying on haptics; show a fallback or disable haptic-only UI when false.
- **Desktop testing**: Use `useWebHaptics({ debug: true })` or `new WebHaptics({ debug: true })` to get audio feedback when vibration is unavailable.

## Accessibility

- Trigger haptics only in response to **user gestures** (e.g. button click). Do not auto-fire on page load or without user action.
- Users can disable vibration at the OS or browser level; the API will no-op when unsupported or disabled.
