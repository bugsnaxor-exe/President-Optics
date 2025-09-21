import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children, defaultTheme = 'ocean-green', attribute = 'class' }) => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or use default
    if (typeof window !== 'undefined') {
      return localStorage.getItem('optacore-theme') || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('ocean-green', 'cyberpunk', 'ocean', 'sunset', 'forest');
    root.classList.add(theme);

    // Save theme to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('optacore-theme', theme);
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