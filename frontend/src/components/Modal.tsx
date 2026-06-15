import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 px-4 py-6"
      role="dialog"
      aria-modal
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          className="w-full max-w-lg max-h-[calc(100vh-3rem)] rounded-2xl bg-white shadow-xl flex flex-col"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 flex-shrink-0 px-6 pt-6">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Cerrar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex-1 min-h-0 overflow-y-auto px-6 text-sm text-slate-700">
            {children}
          </div>
          {footer && (
            <div className="flex-shrink-0 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
