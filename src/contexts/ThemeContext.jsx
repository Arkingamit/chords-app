import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children, defaultTheme = "system", storageKey = "vite-ui-theme" }) => {
  const [theme, setThemeState] = useState(() => {
    // Check local storage for a previously saved theme
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(storageKey);
      if (savedTheme) {
        return savedTheme;
      }
      // Check system preference if defaultTheme is 'system'
      if (defaultTheme === "system" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
    }
    return defaultTheme;
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetTheme, setTargetTheme] = useState(null);

  useEffect(() => {
    const root = window.document.documentElement;
    // Apply the theme class only when not transitioning
    if (!isTransitioning && targetTheme) {
      root.classList.remove("light", "dark");
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
      localStorage.setItem(storageKey, theme);
      setTargetTheme(null); // Reset target theme after applying
    } else if (isTransitioning && targetTheme) {
        // During transition, the actual theme class won't be applied until animation is done.
        // We'll manage the visual transition in ThemeTransition component.
    }
  }, [theme, isTransitioning, targetTheme, storageKey]);

  const initiateThemeTransition = (newTheme) => {
    if (theme === newTheme) return; // No transition if already on the theme

    setIsTransitioning(true);
    setTargetTheme(newTheme);
    // The ThemeTransition component will handle setting the actual theme class after animation
  };

  const completeThemeTransition = (finalTheme) => {
    setThemeState(finalTheme); // Set the new theme
    setIsTransitioning(false); // End the transition state
    // localStorage.setItem(storageKey, finalTheme); // This is already handled by the useEffect above
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: initiateThemeTransition, isTransitioning, targetTheme, completeThemeTransition }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};