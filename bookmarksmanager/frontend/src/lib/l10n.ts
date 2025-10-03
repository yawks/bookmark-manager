/* eslint-disable @typescript-eslint/no-explicit-any */

// Since 't' is a global function provided by Nextcloud, we need to declare it
// to make TypeScript happy. We also declare the OC object.
declare const OC: any;
declare function t(appId: string, text: string, vars?: Record<string, unknown>, escape?: boolean): string;

const APP_ID = 'bookmarksmanager';

/**
 * A wrapper for Nextcloud's translation function.
 * It provides a safe way to call the global `t` function, with a fallback
 * to the original text if the function is not available.
 *
 * @param text The English text to be translated.
 * @returns The translated string.
 */
export function translate(text: string): string {
  // Check if the global 't' function exists, otherwise return the original text.
  if (typeof t === 'function') {
    return t(APP_ID, text);
  }
  // Fallback for environments where Nextcloud's globals are not present
  return text;
}