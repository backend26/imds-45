import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export const useGSAPAnimations = () => {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize animations on mount
    const timer = setTimeout(() => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return {
    pageRef
  };
};