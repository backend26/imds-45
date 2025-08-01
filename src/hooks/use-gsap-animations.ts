import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export const useGSAPAnimations = () => {
  const pageRef = useRef<HTMLDivElement>(null);

  // Enhanced page loading animation with staggered grid
  const animatePageLoad = () => {
    const tl = gsap.timeline();
    
    // Hero section fade-in with scale
    tl.from('.hero-section', {
      opacity: 0,
      y: 50,
      scale: 0.95,
      duration: 1.2,
      ease: 'power3.out'
    });

    // Staggered card animation
    tl.from('.article-card', {
      opacity: 0,
      y: 60,
      scale: 0.9,
      duration: 0.8,
      stagger: {
        amount: 0.6,
        from: "start"
      },
      ease: 'back.out(1.7)'
    }, '-=0.8');

    // Sidebar animations
    tl.from('.sidebar-module', {
      opacity: 0,
      x: 30,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power2.out'
    }, '-=0.4');

    return tl;
  };

  // Enhanced card hover animation with physics
  const animateCardHover = (element: HTMLElement, isHovering: boolean) => {
    if (isHovering) {
      gsap.to(element, {
        y: -12,
        scale: 1.03,
        duration: 0.4,
        ease: 'power3.out',
        boxShadow: '0 25px 50px rgba(255, 48, 54, 0.25), 0 10px 30px rgba(0, 0, 0, 0.3)',
        rotationY: 2,
        transformPerspective: 1000
      });
    } else {
      gsap.to(element, {
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power3.out',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        rotationY: 0
      });
    }
  };

  // Advanced icon click animation with burst effect
  const animateIconClick = (element: HTMLElement) => {
    const tl = gsap.timeline();
    
    // Main icon animation
    tl.to(element, {
      scale: 0.7,
      duration: 0.15,
      ease: 'power2.in'
    })
    .to(element, {
      scale: 1.3,
      duration: 0.25,
      ease: 'back.out(2.5)'
    })
    .to(element, {
      scale: 1,
      duration: 0.15,
      ease: 'power2.out'
    });

    // Create burst particles
    const createBurst = () => {
      const particles = [];
      for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.className = 'burst-particle';
        particle.style.cssText = `
          position: absolute;
          width: 4px;
          height: 4px;
          background: hsl(var(--primary));
          border-radius: 50%;
          pointer-events: none;
          z-index: 1000;
        `;
        element.appendChild(particle);
        particles.push(particle);
      }

      particles.forEach((particle, index) => {
        const angle = (index / particles.length) * Math.PI * 2;
        const distance = 20;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        gsap.to(particle, {
          x,
          y,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => particle.remove()
        });
      });
    };

    createBurst();
    return tl;
  };

  // Smooth page transitions
  const animatePageTransition = (direction: 'in' | 'out') => {
    if (direction === 'out') {
      return gsap.to(pageRef.current, {
        opacity: 0,
        y: -30,
        scale: 0.95,
        duration: 0.4,
        ease: 'power2.in'
      });
    } else {
      return gsap.fromTo(pageRef.current, 
        { opacity: 0, y: 30, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.6, 
          ease: 'power3.out' 
        }
      );
    }
  };

  // Animated statistics counter
  const animateCounter = (element: HTMLElement, endValue: number, suffix = '') => {
    const obj = { value: 0 };
    
    gsap.to(obj, {
      value: endValue,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = Math.round(obj.value) + suffix;
      }
    });
  };

  // Scroll-triggered animations for article pages
  const initScrollAnimations = () => {
    // Animate elements as they enter viewport
    gsap.utils.toArray('.scroll-animate').forEach((element: any) => {
      gsap.fromTo(element, 
        { 
          opacity: 0, 
          y: 50 
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Parallax effect for images
    gsap.utils.toArray('.parallax-image').forEach((element: any) => {
      gsap.to(element, {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  };

  // Grid filter animation
  const animateGridFilter = (elements: NodeListOf<Element>) => {
    const tl = gsap.timeline();
    
    // Fade out current items
    tl.to(elements, {
      opacity: 0,
      y: 20,
      scale: 0.95,
      duration: 0.3,
      stagger: 0.05,
      ease: 'power2.in'
    });

    // Fade in new items
    tl.to(elements, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      stagger: 0.08,
      ease: 'back.out(1.7)'
    });

    return tl;
  };

  useEffect(() => {
    // Initialize animations on mount
    const timer = setTimeout(() => {
      animatePageLoad();
      initScrollAnimations();
    }, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return {
    pageRef,
    animateCardHover,
    animateIconClick,
    animatePageTransition,
    animateCounter,
    animateGridFilter,
    initScrollAnimations
  };
};