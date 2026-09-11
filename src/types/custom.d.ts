/// <reference types="node" />

interface Window {
  /** Runtime-injected API base URL (set by the Electron preload/host page). */
  APIConfig?: { baseURL?: string } | undefined;
}

// Minimal ambient typings for the i18n stack. These shadow the packages' bundled
// types so the obsolete `@types/react-i18next` (pinned in package.json) cannot
// conflict. Keep declarations in sync with what src/i18n + src/hooks actually use.

declare module 'i18next' {
  export interface i18n {
    t: (_key: string, _options?: Record<string, unknown>) => string;
    changeLanguage: (_lang: string) => Promise<void>;
    init: (_config: Record<string, unknown>) => Promise<void>;
    language: string;
    use: (_plugin: unknown) => i18n;
  }
  const i18next: i18n;
  export default i18next;
}

declare module 'react-i18next' {
  export function useTranslation(_scope?: string): {
    t: (_key: string, _options?: Record<string, unknown>) => string;
    i18n: import('i18next').i18n;
    ready: boolean;
  };
  export function withTranslation<T extends Record<string, unknown>>(
    _WrappedComponent: React.ComponentType<T>,
  ): React.ComponentType<Omit<T, 't'>>;
  export const Trans: React.FC<{
    i18nKey: string;
    children?: React.ReactNode;
    components?: Record<string, React.ReactNode>;
  }>;
  export const initReactI18next: {
    type: '3rdParty';
    init: (_i18next: import('i18next').i18n) => void;
  };
}

declare module 'i18next-browser-languagedetector' {
  export default class LanguageDetector {
    constructor();
  }
}
