
import * as React from 'react';
import { translations } from '@/lib/translations';

const LanguageContext = React.createContext(undefined);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = React.useState('en');
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    try {
      const storedLanguage = localStorage.getItem('app-language');
      if (storedLanguage && translations[storedLanguage]) {
        setLanguageState(storedLanguage);
      }
    } catch (error) {
      console.warn('Could not read language from localStorage', error);
    }
  }, []);

  const setLanguage = (newLanguage) => {
    setLanguageState(newLanguage);
    try {
      localStorage.setItem('app-language', newLanguage);
    } catch (error) {
      console.warn('Could not save language to localStorage', error);
    }
  };

  const t = (key) => {
    if (!isMounted) return key; // Return key as fallback during SSR
    return translations[language][key] || translations['en'][key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
