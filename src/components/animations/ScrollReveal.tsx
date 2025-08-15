import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  delay?: number;
  duration?: number;
  distance?: number;
  triggerStart?: string;
  triggerEnd?: string;
  className?: string;
}

export const ScrollReveal = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  distance = 50,
  triggerStart = 'top 80%',
  triggerEnd = 'bottom 20%',
  className = ''
}: ScrollRevealProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Initial state based on direction
    const initialState: any = { opacity: 0 };
    const finalState: any = { opacity: 1 };

    switch (direction) {
      case 'up':
        initialState.y = distance;
        finalState.y = 0;
        break;
      case 'down':
        initialState.y = -distance;
        finalState.y = 0;
        break;
      case 'left':
        initialState.x = distance;
        finalState.x = 0;
        break;
      case 'right':
        initialState.x = -distance;
        finalState.x = 0;
        break;
      case 'scale':
        initialState.scale = 0.8;
        finalState.scale = 1;
        break;
      case 'fade':
        // Only opacity animation
        break;
    }

    // Set initial state
    gsap.set(element, initialState);

    // Create scroll trigger animation
    gsap.to(element, {
      ...finalState,
      duration,
      delay,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: triggerStart,
        end: triggerEnd,
        toggleActions: 'play none none reverse'
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [direction, delay, duration, distance, triggerStart, triggerEnd]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

// Staggered scroll reveal for lists
interface StaggerRevealProps {
  children: React.ReactNode;
  stagger?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export const StaggerReveal = ({
  children,
  stagger = 0.1,
  direction = 'up',
  className = ''
}: StaggerRevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.children;
    if (!items.length) return;

    // Initial state
    const initialState: any = { opacity: 0 };
    const finalState: any = { opacity: 1 };

    switch (direction) {
      case 'up':
        initialState.y = 30;
        finalState.y = 0;
        break;
      case 'down':
        initialState.y = -30;
        finalState.y = 0;
        break;
      case 'left':
        initialState.x = 30;
        finalState.x = 0;
        break;
      case 'right':
        initialState.x = -30;
        finalState.x = 0;
        break;
    }

    // Set initial state for all items
    gsap.set(items, initialState);

    // Create staggered animation
    gsap.to(items, {
      ...finalState,
      duration: 0.6,
      stagger,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === container) {
          trigger.kill();
        }
      });
    };
  }, [stagger, direction]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};