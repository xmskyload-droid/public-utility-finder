import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface Props {
  message: string;
  onDone?: () => void;
}

export function SuccessToast({ message, onDone }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onDone?.();
    }, 2400);
    return () => clearTimeout(timerRef.current);
  }, [onDone]);

  return ReactDOM.createPortal(
    <div className="success-toast" role="status" aria-live="polite">
      <span style={{ animation: 'checkPop 400ms var(--ease-spring) both', display: 'inline-block' }}>✓</span>
      {message}
    </div>,
    document.body
  );
}

// Hook to show toast
import { useState, useCallback } from 'react';

export function useSuccessToast() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  const ToastElement = toast ? (
    <SuccessToast message={toast} onDone={() => setToast(null)} />
  ) : null;

  return { showToast, ToastElement };
}
