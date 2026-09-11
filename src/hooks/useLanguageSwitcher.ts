import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useLanguageSwitcher() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLang(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('i18nextLng', lang);
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  return { currentLang, changeLanguage, languages };
}
