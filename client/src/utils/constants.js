// Common constants used across the application

export const SEVERITY_LEVELS = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

export const STATUS_TYPES = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed'
};

export const USER_ROLES = {
  COMMUTER: 'commuter',
  ADMIN: 'admin',
  MUNICIPALITY: 'municipality'
};

export const MAP_LAYERS = {
  STREET: 'street',
  SATELLITE: 'satellite',
  DARK: 'dark'
};

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  FILE_SIZE_LIMIT: 'File size must be less than 5MB',
  INVALID_FILE_TYPE: 'Invalid file type'
};

export const FILE_CONSTRAINTS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
  MAX_IMAGE_DIMENSION: 4096
};

export const API_ENDPOINTS = {
  POTHOLES: '/api/potholes',
  AUTH: '/api/auth',
  USERS: '/api/users',
  REPORTS: '/api/reports',
  MUNICIPALITY: '/api/municipality'
};
