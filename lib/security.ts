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
   * Advanced Content Protection
   */
  static enableContentProtection(): void {
    // Disable text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    (document.body.style as any).mozUserSelect = 'none';
    (document.body.style as any).msUserSelect = 'none';

    // Disable drag and drop
    document.addEventListener('dragstart', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
    document.addEventListener('dragover', (e) => e.preventDefault());

    // Disable image saving
    document.addEventListener('contextmenu', (e) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    });

    // Prevent copy/paste operations
    document.addEventListener('copy', (e) => {
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        e.clipboardData?.setData('text/plain', 'Content copying is disabled for security reasons.');
        e.preventDefault();
      }
    });

    document.addEventListener('cut', (e) => {
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        e.preventDefault();
      }
    });

    // Disable print screen and screenshots
    document.addEventListener('keydown', (e) => {
      if (e.key === 'PrintScreen' || 
          (e.ctrlKey && e.key === 'p') ||
          (e.ctrlKey && e.shiftKey && e.key === 'S')) {
        e.preventDefault();
        alert('Screenshots and printing are disabled for security reasons.');
      }
    });

    // Add watermark overlay
    this.addWatermark();
  }

  /**
   * Add invisible watermark to prevent unauthorized copying
   */
  static addWatermark(): void {
    const watermark = document.createElement('div');
    watermark.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        background-image: 
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 100px,
            rgba(0,0,0,0.02) 100px,
            rgba(0,0,0,0.02) 101px
          );
        font-family: Arial, sans-serif;
        font-size: 12px;
        color: rgba(0,0,0,0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(-45deg);
      ">
        Interactive ML Learning Hub - Protected Content
      </div>
    `;
    document.body.appendChild(watermark);
  }

  /**
   * Anti-forgery token generation and validation
   */
  static generateAntiForgeryToken(): string {
    const token = this.generateSecureId(32);
    const timestamp = Date.now();
    const payload = btoa(JSON.stringify({ token, timestamp }));
    
    // Store in secure storage
    this.secureStorage.set('anti_forgery_token', payload, true);
    
    return payload;
  }

  static validateAntiForgeryToken(token: string): boolean {
    try {
      const stored = this.secureStorage.get('anti_forgery_token', true);
      if (!stored) return false;

      const storedData = JSON.parse(atob(stored));
      const tokenData = JSON.parse(atob(token));

      // Check if tokens match and not expired (5 minutes)
      const isValid = storedData.token === tokenData.token && 
                     (Date.now() - tokenData.timestamp) < 300000;

      return isValid;
    } catch {
      return false;
    }
  }

  /**
   * Detect and prevent automated scraping
   */
  static enableAntiScrapingProtection(): void {
    let mouseMovements = 0;
    let keystrokes = 0;
    let scrollEvents = 0;
    let startTime = Date.now();

    // Track human-like behavior
    document.addEventListener('mousemove', () => mouseMovements++);
    document.addEventListener('keydown', () => keystrokes++);
    document.addEventListener('scroll', () => scrollEvents++);

    // Check for bot-like behavior every 30 seconds
    setInterval(() => {
      const timeElapsed = (Date.now() - startTime) / 1000;
      const humanScore = (mouseMovements + keystrokes + scrollEvents) / timeElapsed;

      // If very low human interaction, might be a bot
      if (timeElapsed > 30 && humanScore < 0.1) {
        console.warn('Potential automated access detected');
        
        // Add CAPTCHA-like challenge
        this.showHumanVerification();
      }

      // Reset counters
      mouseMovements = keystrokes = scrollEvents = 0;
      startTime = Date.now();
    }, 30000);
  }

  /**
   * Show human verification challenge
   */
  static showHumanVerification(): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
    `;

    const challenge = Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10);
    const answer = challenge;

    overlay.innerHTML = `
      <div style="
        background: white;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      ">
        <h3>Human Verification Required</h3>
        <p>Please solve this simple math problem to continue:</p>
        <p style="font-size: 24px; margin: 20px 0;">What is ${Math.floor(challenge/2)} + ${Math.ceil(challenge/2)}?</p>
        <input type="number" id="verification-answer" style="
          padding: 10px;
          border: 2px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
          width: 100px;
          text-align: center;
        ">
        <br><br>
        <button onclick="SecurityUtils.verifyHuman(${answer})" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        ">Verify</button>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  /**
   * Verify human challenge response
   */
  static verifyHuman(correctAnswer: number): void {
    const input = document.getElementById('verification-answer') as HTMLInputElement;
    const userAnswer = parseInt(input?.value || '0');

    if (userAnswer === correctAnswer) {
      // Remove verification overlay
      const overlay = input?.closest('[style*="position: fixed"]') as HTMLElement;
      overlay?.remove();
      
      // Mark as verified for this session
      sessionStorage.setItem('human_verified', 'true');
    } else {
      alert('Incorrect answer. Please try again.');
      input.value = '';
      input.focus();
    }
  }

  /**
   * Detect iframe embedding and prevent unauthorized embedding
   */
  static preventIframeEmbedding(): void {
    // Check if page is loaded in iframe
    if (window.self !== window.top) {
      // Get parent domain
      let parentDomain = '';
      try {
        parentDomain = window.parent.location.hostname;
      } catch {
        // Cross-origin iframe - block it
        document.body.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: Arial, sans-serif;
            background: #f8f9fa;
            color: #333;
          ">
            <div style="text-align: center;">
              <h2>Unauthorized Embedding Detected</h2>
              <p>This content cannot be displayed in an iframe for security reasons.</p>
              <a href="${window.location.href}" target="_blank" style="
                color: #007bff;
                text-decoration: none;
                font-weight: bold;
              ">Open in New Window</a>
            </div>
          </div>
        `;
        return;
      }

      // Check if parent domain is authorized
      const authorizedDomains = ['localhost', 'your-domain.com'];
      if (!authorizedDomains.includes(parentDomain)) {
        if (window.top) {
          window.top.location = window.location.href;
        }
      }
    }
  }

  /**
   * Monitor for suspicious activity
   */
  static enableActivityMonitoring(): void {
    let suspiciousActivity = 0;

    // Monitor rapid requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const rateLimitCheck = SecurityUtils.checkRateLimit('api_requests');
      if (!rateLimitCheck.allowed) {
        suspiciousActivity++;
        console.warn('Rate limit exceeded for API requests');
      }
      return originalFetch.apply(this, args);
    };

    // Monitor console access
    let devToolsOpen = false;
    const threshold = 160;

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          suspiciousActivity++;
          console.warn('Developer tools detected');
        }
      } else {
        devToolsOpen = false;
      }
    }, 500);

    // Monitor for automated behavior
    let rapidClicks = 0;
    document.addEventListener('click', () => {
      rapidClicks++;
      setTimeout(() => rapidClicks--, 1000);
      
      if (rapidClicks > 10) {
        suspiciousActivity++;
        console.warn('Rapid clicking detected - possible automation');
      }
    });

    // Take action if too much suspicious activity
    setInterval(() => {
      if (suspiciousActivity > 5) {
        console.warn('High suspicious activity detected');
        // Could implement additional security measures here
        suspiciousActivity = 0; // Reset counter
      }
    }, 60000);
  }

  /**
   * Initialize comprehensive security measures
   */
  static initializeSecurity(): void {
    // Basic security measures
    document.addEventListener('securitypolicyviolation', this.handleCSPViolation);

    // Prevent iframe embedding
    this.preventIframeEmbedding();

    // Enable content protection (only in production)
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      this.enableContentProtection();
      this.enableAntiScrapingProtection();
      this.enableActivityMonitoring();
    }

    // Disable right-click context menu (production only)
    document.addEventListener('contextmenu', (e) => {
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        e.preventDefault();
      }
    });

    // Disable F12 and other dev tools shortcuts (production only)
    document.addEventListener('keydown', (e) => {
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'C') ||
            (e.ctrlKey && e.key === 'U') ||
            (e.ctrlKey && e.key === 's') ||
            (e.ctrlKey && e.key === 'a')) {
          e.preventDefault();
        }
      }
    });

    // Clear sensitive data on page unload
    window.addEventListener('beforeunload', () => {
      this.secureStorage.clear();
    });

    // Generate anti-forgery token for session
    this.generateAntiForgeryToken();

    console.log('Comprehensive security measures initialized');
  }
}

export default SecurityUtils;