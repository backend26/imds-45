import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

/**
 * FASE 3: ACCESSIBILITY ENHANCEMENT
 * Comprehensive accessibility provider with WCAG 2.1 AA compliance
 */

interface AccessibilitySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  keyboardNavigation: boolean;
  screenReader: boolean;
  focusVisible: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  focusNext: () => void;
  focusPrevious: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load settings from localStorage or detect from system preferences
    const savedSettings = localStorage.getItem('accessibility-settings');
    const defaultSettings: AccessibilitySettings = {
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      fontSize: 'medium',
      keyboardNavigation: false,
      screenReader: false,
      focusVisible: true,
    };

    if (savedSettings) {
      try {
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      } catch {
        return defaultSettings;
      }
    }

    return defaultSettings;
  });

  const [screenReaderContainer, setScreenReaderContainer] = useState<HTMLElement | null>(null);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);

  // Create screen reader announcement container
  useEffect(() => {
    const container = document.createElement('div');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    container.style.position = 'absolute';
    container.style.left = '-10000px';
    container.style.width = '1px';
    container.style.height = '1px';
    container.style.overflow = 'hidden';
    
    document.body.appendChild(container);
    setScreenReaderContainer(container);

    return () => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, []);

  // Apply accessibility settings to DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xl: '20px'
    };
    root.style.fontSize = fontSizeMap[settings.fontSize];

    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply reduced motion
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply focus visible
    if (settings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    // Save settings
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Keyboard navigation setup
  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const updateFocusableElements = () => {
      const selectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[role="button"]:not([disabled])',
        '[role="link"]',
        '[role="menuitem"]',
        '[role="tab"]'
      ].join(', ');

      const elements = Array.from(document.querySelectorAll(selectors)) as HTMLElement[];
      const visibleElements = elements.filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               el.offsetParent !== null;
      });

      setFocusableElements(visibleElements);
    };

    updateFocusableElements();

    // Update focusable elements when DOM changes
    const observer = new MutationObserver(updateFocusableElements);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'tabindex', 'hidden']
    });

    return () => observer.disconnect();
  }, [settings.keyboardNavigation]);

  // Keyboard event handling
  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip navigation if user is typing in input elements
      const activeElement = document.activeElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.getAttribute('contenteditable') === 'true'
      )) {
        return;
      }

      switch (event.key) {
        case 'Tab':
          // Let default tab behavior work, but track focus
          setTimeout(() => {
            const activeEl = document.activeElement as HTMLElement;
            const index = focusableElements.indexOf(activeEl);
            setCurrentFocusIndex(index);
          }, 0);
          break;
          
        case 'ArrowDown':
        case 'j': // Vim-style navigation
          event.preventDefault();
          focusNext();
          break;
          
        case 'ArrowUp':
        case 'k': // Vim-style navigation
          event.preventDefault();
          focusPrevious();
          break;
          
        case 'Home':
          event.preventDefault();
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
            setCurrentFocusIndex(0);
          }
          break;
          
        case 'End':
          event.preventDefault();
          if (focusableElements.length > 0) {
            const lastIndex = focusableElements.length - 1;
            focusableElements[lastIndex].focus();
            setCurrentFocusIndex(lastIndex);
          }
          break;
          
        case 'Escape':
          // Remove focus from current element
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          setCurrentFocusIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboardNavigation, focusableElements, currentFocusIndex]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!screenReaderContainer) return;

    screenReaderContainer.setAttribute('aria-live', priority);
    screenReaderContainer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (screenReaderContainer) {
        screenReaderContainer.textContent = '';
      }
    }, 1000);
  };

  const focusNext = () => {
    if (focusableElements.length === 0) return;
    
    const nextIndex = currentFocusIndex >= focusableElements.length - 1 ? 0 : currentFocusIndex + 1;
    focusableElements[nextIndex]?.focus();
    setCurrentFocusIndex(nextIndex);
  };

  const focusPrevious = () => {
    if (focusableElements.length === 0) return;
    
    const prevIndex = currentFocusIndex <= 0 ? focusableElements.length - 1 : currentFocusIndex - 1;
    focusableElements[prevIndex]?.focus();
    setCurrentFocusIndex(prevIndex);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        announceToScreenReader,
        focusNext,
        focusPrevious,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Enhanced focus management hook
export const useFocusManagement = () => {
  const { settings } = useAccessibility();
  
  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  };

  return { trapFocus };
};

// Skip link component for accessibility
export const SkipLink: React.FC<{ href: string; children: ReactNode }> = ({ href, children }) => {
  return (
    <a
      href={href}
      className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      onClick={(e) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target instanceof HTMLElement) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }}
    >
      {children}
    </a>
  );
};