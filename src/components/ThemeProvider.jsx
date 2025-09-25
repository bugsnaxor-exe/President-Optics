import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

export const ThemeProvider = ({ children, defaultTheme = 'ocean-green', attribute = 'class' }) => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or use default
    if (typeof window !== 'undefined' && isLocalStorageAvailable()) {
      try {
        return localStorage.getItem('optacore-theme') || defaultTheme;
      } catch (error) {
        console.warn('Could not read theme from localStorage', error);
        return defaultTheme;
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('ocean-green', 'cyberpunk', 'ocean', 'sunset', 'forest');
    root.classList.add(theme);

    // Save theme to localStorage
    if (typeof window !== 'undefined' && isLocalStorageAvailable()) {
      try {
        localStorage.setItem('optacore-theme', theme);
      } catch (error) {
        console.warn('Could not save theme to localStorage', error);
      }
    }
  }, [theme]);

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};