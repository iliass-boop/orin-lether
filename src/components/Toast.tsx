'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import styles from './Toast.module.css';

interface ToastItem {
    id: number;
    message: string;
    type: 'success' | 'info' | 'error';
}

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const idRef = useRef(0);

    const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
        const id = ++idRef.current;
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={styles.container} aria-live="polite">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`${styles.toast} ${styles[toast.type]}`}
                    >
                        <span className={styles.icon}>
                            {toast.type === 'success' && '✓'}
                            {toast.type === 'info' && 'ℹ'}
                            {toast.type === 'error' && '✕'}
                        </span>
                        <span className={styles.message}>{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
