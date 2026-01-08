// Server-side constants

// User roles
exports.USER_ROLES = {
  COMMUTER: 'commuter',
  ADMIN: 'admin',
  MUNICIPALITY: 'municipality'
};

// Pothole severity levels
exports.SEVERITY_LEVELS = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

// Pothole status
exports.STATUS_TYPES = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed'
};

// File upload constraints
exports.FILE_CONSTRAINTS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  MAX_IMAGE_DIMENSION: 4096
};

// Validation regex patterns
exports.VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-\+\(\)]{10,}$/,
  PASSWORD_MIN_LENGTH: 6
};

// JWT configuration
exports.JWT_CONFIG = {
  EXPIRES_IN: '7d',
  RESET_TOKEN_EXPIRES: 3600000 // 1 hour in milliseconds
};

// Rewards points
exports.REWARD_POINTS = {
  REPORT_POTHOLE: 10,
  VERIFIED_REPORT: 5,
  BONUS_THRESHOLD: 10
};

// API response messages
exports.MESSAGES = {
  SUCCESS: 'Operation successful',
  ERROR: 'An error occurred',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  DUPLICATE_ENTRY: 'Resource already exists'
};

// HTTP status codes
exports.STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
};
