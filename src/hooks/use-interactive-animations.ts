import { gsap } from 'gsap';

export const useInteractiveAnimations = () => {
  // Responsive icon click with particle burst
  const animateIconClick = (element: HTMLElement) => {
    const tl = gsap.timeline();
    const isMobile = window.innerWidth < 768;
    
    // Enhanced main icon animation with responsive scaling
    tl.to(element, {
      scale: isMobile ? 0.7 : 0.5,
      rotation: -8,
      duration: 0.1,
      ease: 'power3.in'
    })
    .to(element, {
      scale: isMobile ? 1.2 : 1.4,
      rotation: 3,
      duration: isMobile ? 0.2 : 0.3,
      ease: 'back.out(2.5)'
    })
    .to(element, {
      scale: 1,
      rotation: 0,
      duration: 0.15,
      ease: 'elastic.out(1, 0.3)'
    });

    // Create responsive particle burst
    const createResponsiveBurst = () => {
      const particleCount = isMobile ? 8 : 12;
      const particles = [];
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * (isMobile ? 4 : 6) + (isMobile ? 1 : 2);
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
        const distance = Math.random() * (isMobile ? 25 : 40) + (isMobile ? 15 : 20);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        gsap.to(particle, {
          x,
          y,
          scale: 0,
          opacity: 0,
          rotation: Math.random() * 360,
          duration: isMobile ? 0.6 : 0.8,
          ease: 'power3.out',
          onComplete: () => particle.remove()
        });
      });
    };

    createResponsiveBurst();
    return tl;
  };

  // Responsive page transitions
  const animatePageTransition = (direction: 'in' | 'out', element?: HTMLElement) => {
    const target = element || document.querySelector('[data-page-content]');
    if (!target) return;

    const isMobile = window.innerWidth < 768;

    if (direction === 'out') {
      return gsap.to(target, {
        opacity: 0,
        y: isMobile ? -20 : -30,
        scale: 0.98,
        duration: isMobile ? 0.3 : 0.4,
        ease: 'power2.in'
      });
    } else {
      return gsap.fromTo(target, 
        { opacity: 0, y: isMobile ? 20 : 30, scale: 0.98 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: isMobile ? 0.4 : 0.6, 
          ease: 'power3.out' 
        }
      );
    }
  };

  // Animated statistics counter with responsive timing
  const animateCounter = (element: HTMLElement, endValue: number, suffix = '') => {
    const obj = { value: 0 };
    const isMobile = window.innerWidth < 768;
    
    gsap.to(obj, {
      value: endValue,
      duration: isMobile ? 1.5 : 2,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = Math.round(obj.value) + suffix;
      }
    });
  };

  return {
    animateIconClick,
    animatePageTransition,
    animateCounter
  };
};