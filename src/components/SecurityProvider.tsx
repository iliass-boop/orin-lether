'use client';

import { createContext, useContext, useCallback, useMemo, useEffect } from 'react';

/* ============================================
   ORIN — Client-Side Security Provider
   XSS Protection · Input Validation · CSRF
   ============================================ */

// --- Types ---
interface SecurityContextType {
    sanitizeInput: (input: string) => string;
    validateEmail: (email: string) => boolean;
    validatePhone: (phone: string) => boolean;
    getCsrfToken: () => string | null;
    secureHeaders: () => Record<string, string>;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

// --- HTML Entity Encoding (XSS Prevention) ---
const HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#96;',
};

const ENTITY_REGEX = /[&<>"'`/]/g;

function encodeHTMLEntities(str: string): string {
    return str.replace(ENTITY_REGEX, (char) => HTML_ENTITIES[char] || char);
}

// --- Input Sanitization ---
function sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';

    // 1. Trim whitespace
    let sanitized = input.trim();

    // 2. Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // 3. Remove script tags and event handlers
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/javascript\s*:/gi, '');
    sanitized = sanitized.replace(/data\s*:/gi, '');
    sanitized = sanitized.replace(/vbscript\s*:/gi, '');

    // 4. Encode remaining HTML entities
    sanitized = encodeHTMLEntities(sanitized);

    // 5. Limit length to prevent buffer overflow attempts
    if (sanitized.length > 10000) {
        sanitized = sanitized.substring(0, 10000);
    }

    return sanitized;
}

// --- Validation Functions ---
function validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    // RFC 5322 simplified
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
}

function validatePhone(phone: string): boolean {
    if (!phone || typeof phone !== 'string') return false;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-().]/g, ''));
}

// --- CSRF Token Management ---
function getCsrfToken(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}

function getSecureHeaders(): Record<string, string> {
    const token = getCsrfToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['X-CSRF-Token'] = token;
    }
    return headers;
}

// --- Security Provider Component ---
export default function SecurityProvider({ children }: { children: React.ReactNode }) {
    // DevTools tamper warning
    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            // Warn about devtools inspection
            const warningStyle = 'color: red; font-size: 24px; font-weight: bold;';
            const messageStyle = 'color: #333; font-size: 14px;';

            console.log('%c⚠ STOP!', warningStyle);
            console.log(
                '%cThis is a browser feature for developers. If someone told you to paste something here, it\'s likely a scam. Don\'t do it.',
                messageStyle
            );

            // Prevent right-click context menu in production (optional extra layer)
            // This is a deterrent, not a security measure
        }

        // Prevent clickjacking — ensure we're not in an iframe
        // Note: X-Frame-Options: DENY header already prevents iframe embedding at the browser level.
        // This is a defense-in-depth fallback only.
        try {
            if (typeof window !== 'undefined' && window.top !== window.self) {
                if (window.top) {
                    window.top.location.href = window.self.location.href;
                }
            }
        } catch {
            // SecurityError thrown in cross-origin sandboxed iframes — ignore safely.
        }
    }, []);

    // Memoized context value
    const contextValue = useMemo<SecurityContextType>(
        () => ({
            sanitizeInput,
            validateEmail,
            validatePhone,
            getCsrfToken,
            secureHeaders: getSecureHeaders,
        }),
        []
    );

    return (
        <SecurityContext.Provider value={contextValue}>
            {children}
        </SecurityContext.Provider>
    );
}

// --- Hook ---
export function useSecurity(): SecurityContextType {
    const context = useContext(SecurityContext);
    if (!context) {
        throw new Error('useSecurity must be used within a SecurityProvider');
    }
    return context;
}

// --- Secure Fetch Wrapper ---
export async function secureFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const headers = new Headers(options.headers);

    // Add CSRF token
    const csrfToken = getCsrfToken();
    if (csrfToken) {
        headers.set('X-CSRF-Token', csrfToken);
    }

    // Add request timestamp (replay attack prevention)
    headers.set('X-Request-Timestamp', Date.now().toString());

    return fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin',
    });
}
