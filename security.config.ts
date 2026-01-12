// Security Configuration for ML Algorithm Showcase
export const securityConfig = {
  // Content Security Policy
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.github.com"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    workerSrc: ["'self'"],
    childSrc: ["'none'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    baseUri: ["'self'"],
    manifestSrc: ["'self'"]
  },

  // Security Headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  },

  // File Upload Security
  fileUpload: {
    maxSize: 0.5 * 1024 * 1024, // 0.5MB
    allowedTypes: [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    allowedExtensions: ['.pdf', '.txt', '.doc', '.docx'],
    scanForMalware: true,
    quarantineUploads: true
  },

  // Rate Limiting
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  },

  // Input Validation
  validation: {
    maxInputLength: 1000,
    allowedCharacters: /^[a-zA-Z0-9\s\-_.,!?()[\]{}:;"'@#$%^&*+=<>\/\\|`~]*$/,
    sanitizeHtml: true,
    preventXSS: true
  },

  // Content Protection
  contentProtection: {
    disableRightClick: true,
    disableTextSelection: true,
    disableDragDrop: true,
    disablePrintScreen: true,
    disableDevTools: true,
    addWatermark: true,
    preventCopy: true,
    preventSave: true
  },

  // Anti-Scraping Protection
  antiScraping: {
    enableBotDetection: true,
    humanVerificationThreshold: 0.1, // Human interaction score threshold
    monitoringInterval: 30000, // 30 seconds
    maxSuspiciousActivity: 5,
    enableCaptcha: true
  },

  // Iframe Protection
  iframeProtection: {
    preventEmbedding: true,
    authorizedDomains: ['localhost', 'your-domain.com'],
    blockCrossOrigin: true,
    redirectToSource: true
  },

  // Activity Monitoring
  activityMonitoring: {
    trackMouseMovements: true,
    trackKeystrokes: true,
    trackScrollEvents: true,
    detectDevTools: true,
    detectRapidClicks: true,
    rapidClickThreshold: 10,
    monitorApiRequests: true
  },

  // Anti-Forgery Protection
  antiForgery: {
    tokenLength: 32,
    tokenExpiry: 300000, // 5 minutes
    rotateTokens: true,
    validateOnSubmit: true
  }
} as const;

export type SecurityConfig = typeof securityConfig;
export default securityConfig;