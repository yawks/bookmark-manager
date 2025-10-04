/* eslint-disable @typescript-eslint/no-explicit-any */

// Define the structure of the translations object on the window
declare global {
  interface Window {
    bookmarksManagerTranslations?: Record<string, string>;
  }
}

/**
 * A simple translation function that retrieves a string from the global
 * `window.bookmarksManagerTranslations` object provided by the backend.
 *
 * @param text The English text to be translated (which serves as the key).
 * @returns The translated string, or the original English text if no translation is found.
 */
export function t(text: string): string {
  if (window.bookmarksManagerTranslations && window.bookmarksManagerTranslations[text]) {
    return window.bookmarksManagerTranslations[text];
  }
  return text;
}