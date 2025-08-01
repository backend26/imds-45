import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export const useGSAPAnimations = () => {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pageRef.current) return;

    // Entrance Stagger Animation
    const cards = pageRef.current.querySelectorAll('.article-card');
    gsap.set(cards, { opacity: 0, y: 100, rotateX: -15 });

    gsap.to(cards, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "back.out(1.7)",
      delay: 0.2
    });

    // Physics-based Hover for Hero Elements
    const heroElements = pageRef.current.querySelectorAll('.hero-element');
    heroElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        gsap.to(element, {
          scale: 1.05,
          rotateY: 5,
          rotateX: 5,
          duration: 0.6,
          ease: "elastic.out(1, 0.5)"
        });
      });

      element.addEventListener('mouseleave', () => {
        gsap.to(element, {
          scale: 1,
          rotateY: 0,
          rotateX: 0,
          duration: 0.4,
          ease: "power2.out"
        });
      });
    });

  }, []);

  const animateCardHover = (element: HTMLElement) => {
    gsap.to(element, {
      y: -10,
      scale: 1.02,
      rotateY: 2,
      duration: 0.3,
      ease: "power2.out",
      transformPerspective: 1000
    });
  };

  const animateCardLeave = (element: HTMLElement) => {
    gsap.to(element, {
      y: 0,
      scale: 1,
      rotateY: 0,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const animateIconClick = (element: HTMLElement) => {
    // Particle Burst Effect
    const tl = gsap.timeline();

    tl.to(element, {
      scale: 1.3,
      duration: 0.1,
      ease: "power2.out"
    })
    .to(element, {
      scale: 1,
      duration: 0.3,
      ease: "elastic.out(1, 0.3)"
    });

    // Create particle burst
    createParticleBurst(element);
  };

  const createParticleBurst = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: hsl(355, 100%, 60%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        left: ${centerX}px;
        top: ${centerY}px;
      `;

      document.body.appendChild(particle);

      const angle = (i / 8) * Math.PI * 2;
      const distance = 50 + Math.random() * 30;

      gsap.to(particle, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
        scale: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => particle.remove()
      });
    }
  };

  const animateCounter = (element: HTMLElement, targetValue: number, suffix: string = '') => {
    const obj = { value: 0 };
    gsap.to(obj, {
      value: targetValue,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => {
        element.textContent = `+${obj.value.toFixed(1)}${suffix}`;
      }
    });
  };

  return {
    pageRef,
    animateCardHover,
    animateCardLeave,
    animateIconClick,
    animateCounter
  };
};