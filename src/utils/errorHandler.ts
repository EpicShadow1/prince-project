import { showError, showWarning, showInfo } from '../hooks/useToast';
import { ApiError } from '../services/api';

/**
 * User-friendly error messages that never expose technical details
 */
const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  TIMEOUT: 'The request timed out. Please try again.',
  
  // Client errors (4xx)
  BAD_REQUEST: 'Invalid request. Please check your input.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'A conflict occurred. Please refresh and try again.',
  VALIDATION_ERROR: 'Please correct the errors and try again.',
  
  // Server errors (5xx)
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  MAINTENANCE: 'The system is under maintenance. Please try again later.',
  
  // Generic
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
};

/**
 * Log technical error details for debugging (internal use only)
 */
function logErrorDetails(error: unknown, context: string): void {
  console.group(`🔴 Error in ${context}`);
  console.error('Error:', error);
  
  if (error instanceof ApiError) {
    console.error('Code:', error.code);
    console.error('Status:', error.status);
    console.error('Message:', error.message);
  } else if (error instanceof Error) {
    console.error('Name:', error.name);
    console.error('Stack:', error.stack);
  }
  
  console.groupEnd();
}

/**
 * Get user-friendly error message based on error type
 */
function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 0:
        return ERROR_MESSAGES.NETWORK_ERROR;
      case 400:
        return error.message || ERROR_MESSAGES.BAD_REQUEST;
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 409:
        return ERROR_MESSAGES.CONFLICT;
      case 422:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 408:
      case 504:
        return ERROR_MESSAGES.TIMEOUT;
      case 500:
      case 501:
      case 502:
      case 503:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        if (error.code === 'NETWORK_ERROR') {
          return ERROR_MESSAGES.NETWORK_ERROR;
        }
        if (error.code === 'PARSE_ERROR') {
          return ERROR_MESSAGES.SERVER_ERROR;
        }
        return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }
  
  if (error instanceof Error) {
    // Check for common error patterns
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT;
    }
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Handle API error and show user-friendly toast notification
 * @param error - The error that occurred
 * @param context - Where the error occurred (for logging)
 * @param customMessage - Optional custom message to show
 */
export function handleApiError(
  error: unknown,
  context: string,
  customMessage?: string
): string {
  // Log technical details for debugging
  logErrorDetails(error, context);
  
  // Get user-friendly message
  const userMessage = customMessage || getUserFriendlyMessage(error);
  
  // Show error toast (this is what the user sees)
  showError(userMessage);
  
  return userMessage;
}

/**
 * Handle API error without showing toast (for cases where you want to handle it manually)
 * @param error - The error that occurred
 * @param context - Where the error occurred (for logging)
 */
export function getErrorMessage(error: unknown, context: string): string {
  logErrorDetails(error, context);
  return getUserFriendlyMessage(error);
}

/**
 * Show a warning message
 */
export function showWarningMessage(message: string): void {
  showWarning(message);
}

/**
 * Show an info message
 */
export function showInfoMessage(message: string): void {
  showInfo(message);
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 0 || error.code === 'NETWORK_ERROR';
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('network') || message.includes('fetch');
  }
  return false;
}

/**
 * Check if error is an authentication error (401)
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 401 || error.code === 'UNAUTHORIZED';
  }
  return false;
}

/**
 * Check if error is a permission error (403)
 */
export function isPermissionError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 403 || error.code === 'FORBIDDEN';
  }
  return false;
}

/**
 * Check if error is a validation error (400, 422)
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 400 || error.status === 422;
  }
  return false;
}

export default {
  handleApiError,
  getErrorMessage,
  showWarningMessage,
  showInfoMessage,
  isNetworkError,
  isAuthError,
  isPermissionError,
  isValidationError,
};
