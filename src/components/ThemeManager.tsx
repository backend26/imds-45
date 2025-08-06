import { useEffect } from 'react';

export const ThemeManager = () => {
  useEffect(() => {
    // Applica il dark mode come default PRIMA del rendering
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && true); // Default to dark
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return null; // Questo componente non renderizza nulla
};