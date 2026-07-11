import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get saved theme from localStorage or default to false
    const savedTheme = localStorage.getItem('waste-management-theme');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  useEffect(() => {
    // Save theme preference
    localStorage.setItem('waste-management-theme', JSON.stringify(isDarkMode));
    
    // Apply theme to document body
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className={`app-theme ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};