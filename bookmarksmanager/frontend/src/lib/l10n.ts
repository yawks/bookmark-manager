/* eslint-disable @typescript-eslint/no-explicit-any */

// Define the structure of the translations object on the window
declare global {
  interface Window {
    bookmarksManagerTranslations?: Record<string, string>;
    __BUILD_ID__?: string;
  }
}

// Cache for loaded translations
let translationsCache: Record<string, string> | null = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

/**
 * Load translations from JSON files with cache-busting
 */
async function loadTranslations(): Promise<void> {
  if (translationsCache) {
    return Promise.resolve();
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;
  loadPromise = (async () => {
    try {
      // Get the current language (default to 'en')
      const lang = navigator.language.split('-')[0] || 'en';
      const buildId = (window as any).__BUILD_ID__ || Date.now().toString(36);
      
      // Try to load the translation file with cache-busting
      const translationUrl = `/apps/bookmarksmanager/locales/${lang}.json?id=${buildId}`;
      
      const response = await fetch(translationUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.translation) {
          // Flatten the nested translation object
          translationsCache = flattenTranslations(data.translation);
          // Also update window.bookmarksManagerTranslations for backward compatibility
          window.bookmarksManagerTranslations = translationsCache;
        }
      } else {
        // Fallback to English if the requested language is not available
        if (lang !== 'en') {
          const enUrl = `/apps/bookmarksmanager/locales/en.json?id=${buildId}`;
          const enResponse = await fetch(enUrl);
          if (enResponse.ok) {
            const enData = await enResponse.json();
            if (enData.translation) {
              translationsCache = flattenTranslations(enData.translation);
              window.bookmarksManagerTranslations = translationsCache;
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback to window.bookmarksManagerTranslations if available
      if (window.bookmarksManagerTranslations) {
        translationsCache = window.bookmarksManagerTranslations;
      }
    } finally {
      isLoading = false;
    }
  })();

  return loadPromise;
}

/**
 * Flatten nested translation object to dot notation
 */
function flattenTranslations(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        Object.assign(result, flattenTranslations(obj[key], newKey));
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
}

/**
 * A simple translation function that retrieves a string from translations.
 * Supports both dot notation (e.g., "settings.title") and flat keys.
 *
 * @param text The translation key (can be dot notation or flat key).
 * @returns The translated string, or the original key if no translation is found.
 */
export function t(text: string): string {
  // Initialize translations if not already loaded
  if (!translationsCache && !isLoading) {
    loadTranslations().catch(console.error);
  }

  // Check cache first
  if (translationsCache && translationsCache[text]) {
    return translationsCache[text];
  }

  // Fallback to window.bookmarksManagerTranslations
  if (window.bookmarksManagerTranslations && window.bookmarksManagerTranslations[text]) {
    return window.bookmarksManagerTranslations[text];
  }

  // Return the original text if no translation found
  return text;
}