import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const usePageAnimations = () => {
  // Enhanced page loading animation with responsive staggered grid
  const animatePageLoad = () => {
    const tl = gsap.timeline();
    
    const hero = document.querySelector('.hero-section');
    if (hero) {
      tl.from(hero, {
        opacity: 0,
        y: gsap.utils.clamp(50, 100, window.innerWidth * 0.1),
        scale: 0.95,
        duration: 1.2,
        ease: 'power4.out'
      });
    }

    const cards = document.querySelectorAll('.article-card');
    if (cards.length) {
      tl.from(cards, {
        opacity: 0,
        y: gsap.utils.clamp(40, 80, window.innerWidth * 0.08),
        scale: 0.9,
        rotationY: window.innerWidth > 768 ? 10 : 0,
        duration: 0.8,
        stagger: {
          amount: window.innerWidth > 768 ? 1.2 : 0.8,
          from: "start",
          ease: "power2.inOut"
        },
        ease: 'back.out(1.5)'
      }, '-=0.8');
    }

    const sidebarItems = document.querySelectorAll('.sidebar > *');
    if (sidebarItems.length && window.innerWidth > 1024) {
      tl.from(sidebarItems, {
        opacity: 0,
        x: 40,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.3)'
      }, '-=0.4');
    }

    return tl;
  };

  // Scroll-triggered animations for article pages
  const initScrollAnimations = () => {
    // Responsive scroll animations
    gsap.utils.toArray('.scroll-animate').forEach((element: any) => {
      gsap.fromTo(element, 
        { 
          opacity: 0, 
          y: window.innerWidth > 768 ? 50 : 30
        },
        {
          opacity: 1,
          y: 0,
          duration: window.innerWidth > 768 ? 0.8 : 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Parallax effect for images (desktop only)
    if (window.innerWidth > 768) {
      gsap.utils.toArray('.parallax-image').forEach((element: any) => {
        gsap.to(element, {
          yPercent: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      });
    }
  };

  return {
    animatePageLoad,
    initScrollAnimations
  };
};