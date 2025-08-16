// Color extraction utility for intelligent banner generation
export interface ExtractedColors {
  dominant: string;
  secondary: string;
  accent: string;
  gradient: string;
}

export const extractColorsFromImage = async (imageUrl: string): Promise<ExtractedColors> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Create canvas to analyze image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(getDefaultColors());
          return;
        }

        // Resize for performance
        const size = 150;
        canvas.width = size;
        canvas.height = size;
        
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size);
        
        // Color analysis
        const colors = analyzeColors(imageData.data);
        resolve(colors);
      } catch (error) {
        console.warn('Color extraction failed:', error);
        resolve(getDefaultColors());
      }
    };
    
    img.onerror = () => resolve(getDefaultColors());
    img.src = imageUrl;
  });
};

const analyzeColors = (pixels: Uint8ClampedArray): ExtractedColors => {
  const colorCounts: Map<string, number> = new Map();
  const colorSamples: number[][] = [];
  
  // Sample every 4th pixel for performance
  for (let i = 0; i < pixels.length; i += 16) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    
    // Skip transparent or very dark/light pixels
    if (a < 125 || (r + g + b) < 50 || (r + g + b) > 650) continue;
    
    colorSamples.push([r, g, b]);
    const colorKey = `${Math.floor(r/20)*20}-${Math.floor(g/20)*20}-${Math.floor(b/20)*20}`;
    colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1);
  }
  
  if (colorSamples.length === 0) {
    return getDefaultColors();
  }
  
  // Find dominant colors
  const sortedColors = Array.from(colorCounts.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  
  const [dominantKey] = sortedColors[0] || ['100-100-100'];
  const [r, g, b] = dominantKey.split('-').map(Number);
  
  // Generate harmonious colors
  const dominant = rgbToHsl(r, g, b);
  const secondary = adjustHsl(dominant, 0, -20, 15); // Darker, more saturated
  const accent = adjustHsl(dominant, 30, 10, -10); // Shifted hue
  
  const gradient = `linear-gradient(135deg, 
    hsl(${dominant.h} ${dominant.s}% ${dominant.l}%), 
    hsl(${secondary.h} ${secondary.s}% ${secondary.l}%))`;
  
  return {
    dominant: `hsl(${dominant.h} ${dominant.s}% ${dominant.l}%)`,
    secondary: `hsl(${secondary.h} ${secondary.s}% ${secondary.l}%)`,
    accent: `hsl(${accent.h} ${accent.s}% ${accent.l}%)`,
    gradient
  };
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

const adjustHsl = (hsl: {h: number, s: number, l: number}, hShift: number, sShift: number, lShift: number) => ({
  h: (hsl.h + hShift + 360) % 360,
  s: Math.max(0, Math.min(100, hsl.s + sShift)),
  l: Math.max(10, Math.min(90, hsl.l + lShift))
});

const getDefaultColors = (): ExtractedColors => ({
  dominant: 'hsl(355 100% 60%)', // Primary red
  secondary: 'hsl(355 100% 45%)',
  accent: 'hsl(25 100% 55%)',
  gradient: 'linear-gradient(135deg, hsl(355 100% 60%), hsl(355 100% 45%))'
});

// Cache for performance
const colorCache = new Map<string, ExtractedColors>();

export const getCachedColors = async (imageUrl: string): Promise<ExtractedColors> => {
  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)!;
  }
  
  const colors = await extractColorsFromImage(imageUrl);
  colorCache.set(imageUrl, colors);
  return colors;
};