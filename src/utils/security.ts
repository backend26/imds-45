import DOMPurify from 'dompurify';
import { z } from 'zod';

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed in user input
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};

/**
 * Sanitize HTML content for display (allows safe HTML)
 */
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html);
};

/**
 * Validation schemas using Zod
 */
export const ValidationSchemas = {
  email: z.string().email('Email non valida').min(1, 'Email richiesta'),
  
  password: z.string()
    .min(8, 'Password deve essere almeno 8 caratteri')
    .regex(/[A-Z]/, 'Password deve contenere almeno una lettera maiuscola')
    .regex(/[a-z]/, 'Password deve contenere almeno una lettera minuscola')
    .regex(/[0-9]/, 'Password deve contenere almeno un numero')
    .regex(/[^A-Za-z0-9]/, 'Password deve contenere almeno un carattere speciale'),
  
  username: z.string()
    .min(3, 'Username deve essere almeno 3 caratteri')
    .max(20, 'Username deve essere massimo 20 caratteri')
    .regex(/^[a-z0-9_]+$/, 'Username può contenere solo lettere minuscole, numeri e underscore'),
  
  displayName: z.string()
    .min(1, 'Nome visualizzato richiesto')
    .max(40, 'Nome visualizzato deve essere massimo 40 caratteri')
    .transform(sanitizeInput),
  
  postTitle: z.string()
    .min(1, 'Titolo richiesto')
    .max(200, 'Titolo deve essere massimo 200 caratteri')
    .transform(sanitizeInput),
  
  postContent: z.string()
    .min(1, 'Contenuto richiesto')
    .transform(sanitizeHTML),
  
  comment: z.string()
    .min(1, 'Commento richiesto')
    .max(1000, 'Commento deve essere massimo 1000 caratteri')
    .transform(sanitizeInput)
};

/**
 * Validate CSRF token (for sensitive operations)
 */
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const validateCSRFToken = (token: string): boolean => {
  // Basic validation - in production, you'd store and verify against server
  return token && token.length > 10;
};

/**
 * Check for suspicious patterns in user input
 */
export const detectSuspiciousActivity = (input: string): boolean => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
    /vbscript:/i,
    /data:text\/html/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
};

/**
 * Rate limiting for API calls
 */
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: () => string;
}

class ClientRateLimit {
  private requests: Map<string, number[]> = new Map();
  
  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Get existing requests for this key
    const userRequests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (validRequests.length >= config.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  reset(key: string): void {
    this.requests.delete(key);
  }
}

export const clientRateLimit = new ClientRateLimit();

/**
 * Security headers for API requests
 */
export const getSecurityHeaders = (): HeadersInit => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
};

/**
 * Validate file uploads
 */
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File troppo grande (max 5MB)' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo di file non supportato' };
  }
  
  return { valid: true };
};

/**
 * Content Security Policy
 */
export const getCSPDirectives = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://ybybtquplonmoopexljw.supabase.co",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ');
};