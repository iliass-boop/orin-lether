// Advanced Input Sanitization Utilities
// Designed to scrub user inputs before they are persisted or processed.

/**
 * Escapes HTML characters to prevent XSS.
 * Converts &, <, >, ", and ' to their corresponding HTML entities.
 */
export const escapeHtml = (unsafe: string): string => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

/**
 * Strips all HTML tags from a string.
 */
export const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>?/gm, '');
};

/**
 * Basic email format validation.
 */
export const isValidEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

/**
 * Sanitizes a standard text input (names, addresses, etc.)
 * Strips HTML, trims whitespace, and escapes remaining potentially dangerous chars.
 */
export const sanitizeTextInput = (text: string): string => {
    let sanitized = stripHtml(text);
    sanitized = sanitized.trim();
    return escapeHtml(sanitized);
};

/**
 * Validates a ZIP/Postal Code (Alphanumeric and dashes only, standard length limits).
 */
export const isValidPostalCode = (postalCode: string): boolean => {
    const re = /^[A-Za-z0-9\s-]{3,10}$/;
    return re.test(postalCode);
};
