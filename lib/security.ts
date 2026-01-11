// Security Utilities for ML Algorithm Showcase
import DOMPurify from 'isomorphic-dompurify';
import { securityConfig } from '../security.config';

/**
 * Input Sanitization and Validation
 */
export class SecurityUtils {
  
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false
    });
  }

  /**
   * Validate input against security rules
   */
  static validateInput(input: string, maxLength?: number): {
    isValid: boolean;
    sanitized: string;
    errors: string[];
  } {
    const errors: string[] = [];
    let sanitized = input;

    // Check if input exists
    if (!input || typeof input !== 'string') {
      errors.push('Invalid input type');
      return { isValid: false, sanitized: '', errors };
    }

    // Length validation
    const maxLen = maxLength || securityConfig.validation.maxInputLength;
    if (input.length > maxLen) {
      errors.push(`Input exceeds maximum length of ${maxLen} characters`);
      sanitized = input.substring(0, maxLen);
    }

    // Character validation
    if (!securityConfig.validation.allowedCharacters.test(input)) {
      errors.push('Input contains invalid characters');
    }

    // Sanitize HTML
    sanitized = this.sanitizeHtml(sanitized);

    // Check for potential XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        errors.push('Potentially malicious content detected');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }

  /**
   * Validate file upload security
   */
  static validateFileUpload(file: File): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const config = securityConfig.fileUpload;

    // Check file size
    if (file.size > config.maxSize) {
      errors.push(`File size exceeds maximum limit of ${(config.maxSize / 1024 / 1024).toFixed(1)}MB`);
    }

    // Check file type
    if (!config.allowedTypes.includes(file.type as any)) {
      errors.push('File type not allowed');
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!config.allowedExtensions.includes(extension as any)) {
      errors.push('File extension not allowed');
    }

    // Check for suspicious file names
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|app|deb|pkg|dmg)$/i,
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i,
      /[<>:"|?*]/,
      /^\./,
      /\s+$/
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.name)) {
        errors.push('Suspicious file name detected');
        break;
      }
    }

    // Check for double extensions
    if ((file.name.match(/\./g) || []).length > 1) {
      const parts = file.name.split('.');
      if (parts.length > 2) {
        errors.push('Multiple file extensions not allowed');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate secure random string
   */
  static generateSecureId(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    // Use crypto.getRandomValues for secure randomness
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < length; i++) {
      result += chars[randomArray[i] % chars.length];
    }
    
    return result;
  }

  /**
   * Rate limiting check (client-side)
   */
  static checkRateLimit(key: string): {
    allowed: boolean;
    remainingRequests: number;
    resetTime: number;
  } {
    const now = Date.now();
    const windowMs = securityConfig.rateLimiting.windowMs;
    const maxRequests = securityConfig.rateLimiting.maxRequests;
    
    // Get stored data
    const stored = localStorage.getItem(`rate_limit_${key}`);
    let data = stored ? JSON.parse(stored) : { count: 0, resetTime: now + windowMs };
    
    // Reset if window expired
    if (now > data.resetTime) {
      data = { count: 0, resetTime: now + windowMs };
    }
    
    // Check if limit exceeded
    if (data.count >= maxRequests) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: data.resetTime
      };
    }
    
    // Increment counter
    data.count++;
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(data));
    
    return {
      allowed: true,
      remainingRequests: maxRequests - data.count,
      resetTime: data.resetTime
    };
  }

  /**
   * Secure local storage operations
   */
  static secureStorage = {
    set(key: string, value: any, encrypt: boolean = false): void {
      try {
        const data = encrypt ? btoa(JSON.stringify(value)) : JSON.stringify(value);
        localStorage.setItem(`secure_${key}`, data);
      } catch (error) {
        console.error('Secure storage set error:', error);
      }
    },

    get(key: string, decrypt: boolean = false): any {
      try {
        const data = localStorage.getItem(`secure_${key}`);
        if (!data) return null;
        
        const parsed = decrypt ? JSON.parse(atob(data)) : JSON.parse(data);
        return parsed;
      } catch (error) {
        console.error('Secure storage get error:', error);
        return null;
      }
    },

    remove(key: string): void {
      localStorage.removeItem(`secure_${key}`);
    },

    clear(): void {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('secure_')) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  /**
   * Content Security Policy violation handler
   */
  static handleCSPViolation(event: SecurityPolicyViolationEvent): void {
    console.warn('CSP Violation:', {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber
    });

    // Report to security monitoring (in production)
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Send to security monitoring service
      fetch('/api/security/csp-violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockedURI: event.blockedURI,
          violatedDirective: event.violatedDirective,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      }).catch(console.error);
    }
  }

  /**
   * Initialize security measures
   */
  static initializeSecurity(): void {
    // Add CSP violation listener
    document.addEventListener('securitypolicyviolation', this.handleCSPViolation);

    // Disable right-click context menu (optional)
    document.addEventListener('contextmenu', (e) => {
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        e.preventDefault();
      }
    });

    // Disable F12 and other dev tools shortcuts (optional)
    document.addEventListener('keydown', (e) => {
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'C') ||
            (e.ctrlKey && e.key === 'U')) {
          e.preventDefault();
        }
      }
    });

    // Clear sensitive data on page unload
    window.addEventListener('beforeunload', () => {
      // Clear any sensitive data from memory
      this.secureStorage.clear();
    });

    console.log('Security measures initialized');
  }
}

export default SecurityUtils;