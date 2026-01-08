/**
 * Error Sanitization Utility
 * Extracts only safe, user-facing error messages
 * Strips internal details, UUIDs, stack traces
 */

/**
 * Extracts safe validation error messages from Sequelize errors
 * @param {Error} error - The Sequelize validation error
 * @returns {Array} - Array of safe error messages
 */
export const extractSequelizeValidationErrors = (error) => {
    if (!error || !error.errors) return [];

    return error.errors.map((err) => ({
        field: err.path || 'unknown',
        message: getSafeValidationMessage(err),
    }));
};

/**
 * Gets a safe, user-friendly validation message
 * @param {Object} err - Sequelize validation error item
 * @returns {string} - Safe error message
 */
const getSafeValidationMessage = (err) => {
    const fieldName = err.path || 'field';

    switch (err.validatorKey) {
        case 'len':
            return `${fieldName} has invalid length`;
        case 'isEmail':
            return 'Please provide a valid email address';
        case 'notEmpty':
            return `${fieldName} cannot be empty`;
        case 'is_null':
            return `${fieldName} is required`;
        case 'not_unique':
            return `${fieldName} already exists`;
        case 'isIn':
            return `${fieldName} has an invalid value`;
        case 'min':
            return `${fieldName} is too small`;
        case 'max':
            return `${fieldName} is too large`;
        default:
            return err.message || `${fieldName} is invalid`;
    }
};

/**
 * Sanitizes error for production response
 * @param {Error} error - The error to sanitize
 * @param {boolean} isDevelopment - Whether running in development mode
 * @returns {Object} - Sanitized error response
 */
export const sanitizeError = (error, isDevelopment = false) => {
    // In development, return more details
    if (isDevelopment) {
        return {
            message: error.message,
            errors: error.errors || [],
            stack: error.stack,
        };
    }

    // In production, return minimal information
    return {
        message: getProductionErrorMessage(error),
        errors: getSafeErrors(error),
    };
};

/**
 * Gets a safe production error message
 * @param {Error} error - The error
 * @returns {string} - Safe error message
 */
const getProductionErrorMessage = (error) => {
    // Known safe messages
    if (error.statusCode && error.statusCode < 500) {
        return error.message;
    }

    // For 500+ errors, return generic message
    return 'An unexpected error occurred. Please try again later.';
};

/**
 * Extracts safe errors from various error types
 * @param {Error} error - The error
 * @returns {Array|null} - Safe errors array or null
 */
const getSafeErrors = (error) => {
    // Check if it's a Sequelize error
    if (error.name === 'SequelizeValidationError') {
        return extractSequelizeValidationErrors(error);
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
        return error.errors?.map((err) => ({
            field: err.path || 'unknown',
            message: `${err.path || 'Field'} already exists`,
        })) || [];
    }

    // For other errors, return empty array (don't expose internal details)
    return [];
};

/**
 * Checks if error is a Sequelize error
 * @param {Error} error - The error to check
 * @returns {boolean} - True if Sequelize error
 */
export const isSequelizeError = (error) => {
    const sequelizeErrors = [
        'SequelizeValidationError',
        'SequelizeUniqueConstraintError',
        'SequelizeDatabaseError',
        'SequelizeConnectionError',
        'SequelizeForeignKeyConstraintError',
        'SequelizeExclusionConstraintError',
        'SequelizeTimeoutError',
    ];

    return sequelizeErrors.includes(error.name);
};

/**
 * Gets appropriate status code for Sequelize errors
 * @param {Error} error - The Sequelize error
 * @returns {number} - HTTP status code
 */
export const getSequelizeErrorStatusCode = (error) => {
    switch (error.name) {
        case 'SequelizeValidationError':
            return 400;
        case 'SequelizeUniqueConstraintError':
            return 409;
        case 'SequelizeForeignKeyConstraintError':
            return 400;
        case 'SequelizeDatabaseError':
        case 'SequelizeConnectionError':
        case 'SequelizeTimeoutError':
            return 503;
        default:
            return 500;
    }
};

export default {
    extractSequelizeValidationErrors,
    sanitizeError,
    isSequelizeError,
    getSequelizeErrorStatusCode,
};
