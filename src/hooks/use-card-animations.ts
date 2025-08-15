import { gsap } from 'gsap';

export const useCardAnimations = () => {
  // Responsive card hover with magnetic effect
  const animateCardHover = (element: HTMLElement, isHovering: boolean) => {
    const isMobile = window.innerWidth < 768;
    
    if (isHovering) {
      gsap.to(element, {
        y: isMobile ? -8 : -15,
        scale: isMobile ? 1.02 : 1.05,
        rotationX: isMobile ? 0 : 3,
        rotationY: isMobile ? 0 : 2,
        duration: isMobile ? 0.3 : 0.5,
        ease: 'power4.out',
        boxShadow: isMobile 
          ? '0 10px 30px rgba(255, 48, 54, 0.2)' 
          : '0 30px 60px rgba(255, 48, 54, 0.3), 0 15px 40px rgba(0, 0, 0, 0.2)',
        transformPerspective: isMobile ? 800 : 1200,
        transformOrigin: 'center center'
      });
      
      // Subtle wobble effect (desktop only)
      if (!isMobile) {
        gsap.to(element, {
          rotationZ: 0.5,
          duration: 0.1,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: 1
        });
      }
    } else {
      gsap.to(element, {
        y: 0,
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        duration: isMobile ? 0.3 : 0.6,
        ease: isMobile ? 'power2.out' : 'elastic.out(1, 0.6)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      });
    }
  };

  // Grid filter animation with responsive timing
  const animateGridFilter = (elements: NodeListOf<Element>) => {
    const tl = gsap.timeline();
    const isMobile = window.innerWidth < 768;
    
    // Fade out current items
    tl.to(elements, {
      opacity: 0,
      y: isMobile ? 15 : 20,
      scale: 0.98,
      duration: isMobile ? 0.2 : 0.3,
      stagger: isMobile ? 0.03 : 0.05,
      ease: 'power2.in'
    });

    // Fade in new items
    tl.to(elements, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: isMobile ? 0.3 : 0.5,
      stagger: isMobile ? 0.05 : 0.08,
      ease: 'back.out(1.4)'
    });

    return tl;
  };

  return {
    animateCardHover,
    animateGridFilter
  };
};