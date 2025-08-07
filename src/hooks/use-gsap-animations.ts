import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export const useGSAPAnimations = () => {
  const pageRef = useRef<HTMLDivElement>(null);

  // Enhanced page loading animation with advanced staggered grid
  const animatePageLoad = () => {
    const tl = gsap.timeline();
    
    const hero = document.querySelector('.hero-section');
    if (hero) {
      tl.from(hero, {
        opacity: 0,
        y: 100,
        scale: 0.9,
        duration: 1.5,
        ease: 'power4.out'
      });
    }

    const cards = document.querySelectorAll('.article-card');
    if (cards.length) {
      tl.from(cards, {
        opacity: 0,
        y: 80,
        scale: 0.8,
        rotationY: 15,
        duration: 1,
        stagger: {
          amount: 1.2,
          from: "start",
          ease: "power2.inOut"
        },
        ease: 'back.out(2)'
      }, '-=1');
    }

    const sidebarItems = document.querySelectorAll('.sidebar > *');
    if (sidebarItems.length) {
      tl.from(sidebarItems, {
        opacity: 0,
        x: 50,
        rotationY: 10,
        duration: 0.8,
        stagger: 0.2,
        ease: 'back.out(1.5)'
      }, '-=0.6');
    }

    return tl;
  };

  // Physics-based card hover with magnetic effect
  const animateCardHover = (element: HTMLElement, isHovering: boolean) => {
    if (isHovering) {
      gsap.to(element, {
        y: -15,
        scale: 1.05,
        rotationX: 5,
        rotationY: 3,
        duration: 0.5,
        ease: 'power4.out',
        boxShadow: '0 30px 60px rgba(255, 48, 54, 0.3), 0 15px 40px rgba(0, 0, 0, 0.2)',
        transformPerspective: 1200,
        transformOrigin: 'center center'
      });
      
      // Add subtle wobble effect
      gsap.to(element, {
        rotationZ: 1,
        duration: 0.1,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1
      });
    } else {
      gsap.to(element, {
        y: 0,
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.6)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      });
    }
  };

  // Advanced icon click with explosive particle burst
  const animateIconClick = (element: HTMLElement) => {
    const tl = gsap.timeline();
    
    // Enhanced main icon animation with elastic effect
    tl.to(element, {
      scale: 0.5,
      rotation: -10,
      duration: 0.1,
      ease: 'power3.in'
    })
    .to(element, {
      scale: 1.4,
      rotation: 5,
      duration: 0.3,
      ease: 'back.out(3)'
    })
    .to(element, {
      scale: 1,
      rotation: 0,
      duration: 0.2,
      ease: 'elastic.out(1, 0.3)'
    });

    // Create enhanced burst with different particle types
    const createAdvancedBurst = () => {
      const particles = [];
      for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 6 + 2;
        particle.className = 'burst-particle';
        particle.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          background: ${i % 3 === 0 ? 'hsl(var(--primary))' : i % 3 === 1 ? '#00ff88' : '#ffaa00'};
          border-radius: 50%;
          pointer-events: none;
          z-index: 1000;
          box-shadow: 0 0 ${size * 2}px currentColor;
        `;
        element.appendChild(particle);
        particles.push(particle);
      }

      particles.forEach((particle, index) => {
        const angle = (index / particles.length) * Math.PI * 2;
        const distance = Math.random() * 40 + 20;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        gsap.to(particle, {
          x,
          y,
          scale: 0,
          opacity: 0,
          rotation: Math.random() * 360,
          duration: 0.8,
          ease: 'power3.out',
          onComplete: () => particle.remove()
        });
      });
    };

    createAdvancedBurst();
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