import { useEffect } from 'react';

export const useLiquidAnimation = () => {
  useEffect(() => {
    const turbulence = document.querySelector('#liquid-filter feTurbulence');
    if (!turbulence) return;

    let frame = 0;
    let animationId: number;

    function animateTurbulence() {
      const newBaseFrequency = `0.01 ${0.03 + Math.sin(frame / 200) * 0.005}`;
      turbulence.setAttribute('baseFrequency', newBaseFrequency);
      frame++;
      animationId = requestAnimationFrame(animateTurbulence);
    }

    animateTurbulence();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);
};