import { useState, useCallback } from 'react';

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  isBlocked: boolean;
}

const RATE_LIMIT_KEY = 'malati_sport_rate_limit';
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export function useRateLimit() {
  const [state, setState] = useState<RateLimitState>(() => {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      
      // Check if block duration has expired
      if (parsed.isBlocked && (now - parsed.lastAttempt) > BLOCK_DURATION) {
        return { attempts: 0, lastAttempt: 0, isBlocked: false };
      }
      
      return parsed;
    }
    return { attempts: 0, lastAttempt: 0, isBlocked: false };
  });

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    
    // If blocked and block duration hasn't expired
    if (state.isBlocked && (now - state.lastAttempt) < BLOCK_DURATION) {
      const remainingTime = Math.ceil((BLOCK_DURATION - (now - state.lastAttempt)) / 1000 / 60);
      return {
        allowed: false,
        remainingAttempts: 0,
        remainingTime,
        message: `Troppi tentativi falliti. Riprova tra ${remainingTime} minuti.`
      };
    }

    // If block duration expired, reset
    if (state.isBlocked && (now - state.lastAttempt) >= BLOCK_DURATION) {
      const newState = { attempts: 0, lastAttempt: 0, isBlocked: false };
      setState(newState);
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newState));
      return {
        allowed: true,
        remainingAttempts: MAX_ATTEMPTS,
        remainingTime: 0,
        message: ''
      };
    }

    // Normal rate limiting
    const remainingAttempts = MAX_ATTEMPTS - state.attempts;
    return {
      allowed: remainingAttempts > 0,
      remainingAttempts,
      remainingTime: 0,
      message: remainingAttempts <= 2 && remainingAttempts > 0 
        ? `Attenzione: ${remainingAttempts} tentativi rimasti prima del blocco temporaneo`
        : ''
    };
  }, [state]);

  const recordAttempt = useCallback((success: boolean) => {
    const now = Date.now();
    
    if (success) {
      // Reset on successful login
      const newState = { attempts: 0, lastAttempt: now, isBlocked: false };
      setState(newState);
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newState));
    } else {
      // Increment failed attempts
      const newAttempts = state.attempts + 1;
      const isBlocked = newAttempts >= MAX_ATTEMPTS;
      const newState = { 
        attempts: newAttempts, 
        lastAttempt: now, 
        isBlocked 
      };
      setState(newState);
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newState));
    }
  }, [state.attempts]);

  const getRemainingTime = useCallback(() => {
    if (!state.isBlocked) return 0;
    const now = Date.now();
    const remaining = BLOCK_DURATION - (now - state.lastAttempt);
    return Math.max(0, Math.ceil(remaining / 1000 / 60));
  }, [state.isBlocked, state.lastAttempt]);

  return {
    checkRateLimit,
    recordAttempt,
    getRemainingTime,
    isBlocked: state.isBlocked,
    attempts: state.attempts
  };
}