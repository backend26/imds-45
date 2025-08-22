import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    
    if (!container || !content) return;

    // Skip animation on initial load
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      gsap.set(content, { opacity: 1, y: 0 });
      return;
    }

    // Create timeline for page transition
    const tl = gsap.timeline();

    // Animate out
    tl.to(content, {
      opacity: 0,
      y: -20,
      duration: 0.2,
      ease: 'power2.in'
    });

    // Animate in
    tl.set(content, { y: 20 });
    tl.to(content, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power3.out'
    });

    // Stagger animations for child elements
    tl.from(content.querySelectorAll('.animate-on-enter'), {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.1,
      ease: 'back.out(1.7)'
    }, '-=0.2');

  }, [location.pathname]);

  return (
    <div ref={containerRef} className="min-h-screen">
      <div ref={contentRef} className="opacity-0">
        {children}
      </div>
    </div>
  );
};

// Hook for programmatic page transitions
export const usePageTransition = () => {
  const triggerTransition = (callback: () => void) => {
    const content = document.querySelector('[data-page-content]');
    if (!content) {
      callback();
      return;
    }

    const tl = gsap.timeline({
      onComplete: callback
    });

    tl.to(content, {
      opacity: 0,
      y: -20,
      duration: 0.2,
      ease: 'power2.in'
    });
  };

  return { triggerTransition };
};