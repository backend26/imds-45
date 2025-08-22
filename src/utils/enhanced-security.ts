import DOMPurify from 'dompurify';
import { z } from 'zod';

/**
 * FASE 2: SICUREZZA APPLICAZIONE MIGLIORATA
 * Enhanced security utilities with performance optimization
 */

// Enhanced input sanitization with performance caching
const sanitizationCache = new Map<string, string>();
const CACHE_MAX_SIZE = 1000;

export const sanitizeInput = (input: string): string => {
  // Check cache first for performance
  if (sanitizationCache.has(input)) {
    return sanitizationCache.get(input)!;
  }
  
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false
  });
  
  // Cache with size limit
  if (sanitizationCache.size >= CACHE_MAX_SIZE) {
    const firstKey = sanitizationCache.keys().next().value;
    sanitizationCache.delete(firstKey);
  }
  sanitizationCache.set(input, sanitized);
  
  return sanitized;
};

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    // Stricter HTML sanitization for user content
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ['target'],
    FORBID_ATTR: ['style', 'onerror', 'onload'],
    FORBID_TAGS: ['script', 'object', 'embed', 'base', 'link', 'meta'],
    RETURN_DOM: false
  });
};

// Enhanced validation schemas with better error messages
export const ValidationSchemas = {
  email: z.string()
    .email('Formato email non valido')
    .min(1, 'Email richiesta')
    .max(254, 'Email troppo lunga')
    .transform(val => val.toLowerCase().trim()),
  
  password: z.string()
    .min(8, 'Password deve essere almeno 8 caratteri')
    .max(128, 'Password troppo lunga')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/, 
      'Password deve contenere: maiuscola, minuscola, numero e carattere speciale'),
  
  username: z.string()
    .min(3, 'Username deve essere almeno 3 caratteri')
    .max(20, 'Username deve essere massimo 20 caratteri')
    .regex(/^[a-z0-9_]+$/, 'Solo lettere minuscole, numeri e underscore')
    .refine(val => !val.startsWith('_') && !val.endsWith('_'), 
      'Username non può iniziare o finire con underscore')
    .transform(sanitizeInput),
  
  displayName: z.string()
    .min(1, 'Nome visualizzato richiesto')
    .max(40, 'Nome visualizzato troppo lungo')
    .regex(/^[a-zA-Z0-9\s\u00C0-\u017F._-]+$/, 'Caratteri non validi nel nome')
    .transform(sanitizeInput),
  
  postTitle: z.string()
    .min(10, 'Titolo deve essere almeno 10 caratteri')
    .max(200, 'Titolo troppo lungo')
    .transform(sanitizeInput),
  
  postContent: z.string()
    .min(50, 'Contenuto troppo breve')
    .max(50000, 'Contenuto troppo lungo')
    .transform(sanitizeHTML),
  
  comment: z.string()
    .min(1, 'Commento richiesto')
    .max(1000, 'Commento troppo lungo')
    .transform(sanitizeInput),
    
  url: z.string()
    .url('URL non valido')
    .max(2048, 'URL troppo lungo')
    .refine(val => {
      try {
        const url = new URL(val);
        return ['http:', 'https:'].includes(url.protocol);
      } catch {
        return false;
      }
    }, 'Solo protocolli HTTP/HTTPS consentiti')
};

// Enhanced suspicious activity detection
export const detectSuspiciousActivity = (input: string): { 
  isSuspicious: boolean; 
  risk: 'low' | 'medium' | 'high';
  reasons: string[];
} => {
  const reasons: string[] = [];
  let riskScore = 0;
  
  const suspiciousPatterns = [
    { pattern: /<script|javascript:|vbscript:/i, risk: 3, reason: 'Script injection attempt' },
    { pattern: /on\w+\s*=/i, risk: 2, reason: 'Event handler injection' },
    { pattern: /eval\s*\(|expression\s*\(/i, risk: 3, reason: 'Code execution attempt' },
    { pattern: /data:text\/html|data:application/i, risk: 2, reason: 'Suspicious data URI' },
    { pattern: /\bpassword\b.*\bpassword\b/i, risk: 1, reason: 'Multiple password references' },
    { pattern: /\b(?:admin|root|administrator)\b/i, risk: 1, reason: 'Admin reference' },
    { pattern: /\.\.\/|\.\.\\|%2e%2e/i, risk: 2, reason: 'Path traversal attempt' },
    { pattern: /union\s+select|drop\s+table|delete\s+from/i, risk: 3, reason: 'SQL injection attempt' }
  ];
  
  for (const { pattern, risk, reason } of suspiciousPatterns) {
    if (pattern.test(input)) {
      riskScore += risk;
      reasons.push(reason);
    }
  }
  
  return {
    isSuspicious: riskScore > 0,
    risk: riskScore >= 3 ? 'high' : riskScore >= 2 ? 'medium' : 'low',
    reasons
  };
};

// Enhanced rate limiting with memory optimization
interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked?: boolean;
}

class OptimizedRateLimit {
  private limits = new Map<string, RateLimitEntry>();
  private readonly cleanupInterval: number;
  
  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
  
  check(key: string, config: { maxRequests: number; windowMs: number }): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const entry = this.limits.get(key);
    
    if (!entry || now > entry.resetTime) {
      // New window
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return { allowed: true, remaining: config.maxRequests - 1, resetTime: now + config.windowMs };
    }
    
    if (entry.count >= config.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }
    
    entry.count++;
    return { 
      allowed: true, 
      remaining: config.maxRequests - entry.count, 
      resetTime: entry.resetTime 
    };
  }
  
  reset(key: string): void {
    this.limits.delete(key);
  }
  
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.limits.clear();
  }
}

export const enhancedRateLimit = new OptimizedRateLimit();

// Enhanced file validation with MIME type checking
export const validateFileUpload = (file: File): { 
  valid: boolean; 
  error?: string; 
  metadata?: Record<string, any>;
} => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm'
  ];
  
  // File size check
  if (file.size > maxSize) {
    return { valid: false, error: 'File troppo grande (max 5MB)' };
  }
  
  if (file.size === 0) {
    return { valid: false, error: 'File vuoto non consentito' };
  }
  
  // MIME type check
  if (!allowedMimeTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo file non supportato' };
  }
  
  // File name validation
  if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
    return { valid: false, error: 'Nome file contiene caratteri non validi' };
  }
  
  if (file.name.length > 255) {
    return { valid: false, error: 'Nome file troppo lungo' };
  }
  
  return { 
    valid: true, 
    metadata: {
      size: file.size,
      type: file.type,
      name: file.name,
      lastModified: file.lastModified
    }
  };
};

// Enhanced CSP with better configuration
export const getCSPDirectives = (): string => {
  const isProduction = import.meta.env.PROD;
  
  const directives = [
    "default-src 'self'",
    isProduction 
      ? "script-src 'self' 'wasm-unsafe-eval'"  // Production: stricter
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Development: permissive
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://ybybtquplonmoopexljw.supabase.co wss://ybybtquplonmoopexljw.supabase.co",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    "upgrade-insecure-requests"
  ];
  
  return directives.join('; ');
};

// Enhanced security headers
export const getSecurityHeaders = (): HeadersInit => {
  return {
    'Content-Security-Policy': getCSPDirectives(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  };
};

// CSRF token with enhanced entropy
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string): boolean => {
  return token && /^[a-f0-9]{64}$/.test(token);
};

// Password strength checker
export const checkPasswordStrength = (password: string): {
  score: number; // 0-100
  feedback: string[];
  isStrong: boolean;
} => {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 20;
  else feedback.push('Usa almeno 8 caratteri');
  
  if (password.length >= 12) score += 10;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 15;
  else feedback.push('Aggiungi lettere minuscole');
  
  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push('Aggiungi lettere maiuscole');
  
  if (/[0-9]/.test(password)) score += 15;
  else feedback.push('Aggiungi numeri');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  else feedback.push('Aggiungi caratteri speciali');
  
  // Bonus checks
  if (!/(.)\1{2,}/.test(password)) score += 5; // No repeated characters
  else feedback.push('Evita caratteri ripetuti');
  
  if (password.length >= 16) score += 5;
  
  const commonPasswords = ['password', '123456', 'qwerty', 'abc123'];
  if (!commonPasswords.some(common => password.toLowerCase().includes(common))) {
    score += 5;
  } else {
    feedback.push('Evita password comuni');
  }
  
  return {
    score: Math.min(100, score),
    feedback,
    isStrong: score >= 80
  };
};