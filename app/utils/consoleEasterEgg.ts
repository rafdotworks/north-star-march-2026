/**
 * Console Easter Egg
 * Displays an animated quote in the console when developer tools are opened
 */

const QUOTE = "Progress over movement.";
const AUTHOR = "— Raf";
const TYPING_SPEED = 100; // ms between characters
const AUTHOR_DELAY = 1000; // ms before showing author
const CONSOLE_STYLE =
  "color: #6366f1; font-family: monospace; font-size: 14px; font-weight: 500;";

export const initConsoleEasterEgg = () => {
  // Clear console
  console.clear();

  let currentText = "";
  let currentIndex = 0;

  const typeNextChar = () => {
    if (currentIndex < QUOTE.length) {
      currentText += QUOTE[currentIndex];
      console.log(`%c${currentText}`, CONSOLE_STYLE);
      currentIndex++;
      setTimeout(typeNextChar, TYPING_SPEED);
    } else {
      // Add author after quote is complete
      setTimeout(() => {
        console.log(`%c${AUTHOR}`, CONSOLE_STYLE);
      }, AUTHOR_DELAY);
    }
  };

  // Start typing animation
  typeNextChar();
};
