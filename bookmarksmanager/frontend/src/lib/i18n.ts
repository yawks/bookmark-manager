import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Define the structure of the translations object on the window
declare global {
  interface Window {
    bookmarksManagerTranslations?: Record<string, string>;
    __BUILD_ID__?: string;
  }
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
 * Initialize i18next synchronously with preloaded translations
 * This must be called before rendering the app
 */
export async function initI18n(): Promise<void> {
  try {
    // Get the current language (default to 'en')
    const lang = navigator.language.split('-')[0] || 'en';
    const buildId = (window as any).__BUILD_ID__ || Date.now().toString(36);

    // Try to load the translation file with cache-busting
    const translationUrl = `/apps/bookmarksmanager/locales/${lang}.json?id=${buildId}`;

    let translations: Record<string, string> = {};

    try {
      const response = await fetch(translationUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.translation) {
          translations = flattenTranslations(data.translation);
        }
      } else if (lang !== 'en') {
        // Fallback to English if the requested language is not available
        const enUrl = `/apps/bookmarksmanager/locales/en.json?id=${buildId}`;
        const enResponse = await fetch(enUrl);
        if (enResponse.ok) {
          const enData = await enResponse.json();
          if (enData.translation) {
            translations = flattenTranslations(enData.translation);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback to window.bookmarksManagerTranslations if available
      if (window.bookmarksManagerTranslations) {
        translations = window.bookmarksManagerTranslations;
      }
    }

    // Initialize i18next with preloaded translations
    await i18n
      .use(initReactI18next)
      .init({
        resources: {
          [lang]: {
            translation: translations
          }
        },
        lng: lang,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false // React already escapes values
        },
        react: {
          useSuspense: false // We handle loading ourselves
        }
      });

    // Also update window.bookmarksManagerTranslations for backward compatibility
    window.bookmarksManagerTranslations = translations;
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
    // Initialize with empty translations as fallback
    await i18n
      .use(initReactI18next)
      .init({
        resources: {},
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false
        },
        react: {
          useSuspense: false
        }
      });
  }
}

export default i18n;
