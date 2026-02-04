import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { formatDateTime } from '../utils/bookmarkStorage';

interface BookmarkDetails {
  surahName: string;
  pageNumber: number;
  viewMode: 'mushaf' | 'wordforword';
  createdAt: number;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'destructive';
  bookmarkDetails?: BookmarkDetails;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  bookmarkDetails,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and escape key handling
  useEffect(() => {
    if (!isOpen) return;

    // Focus the cancel button when dialog opens
    cancelButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when dialog is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const dialogContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative z-[10000] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-w-sm w-full p-5"
        style={{
          backgroundColor: 'var(--color-bg-card, white)',
          borderColor: 'var(--color-border, #e5e7eb)',
        }}
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"
          style={{ color: 'var(--color-text-primary, #111827)' }}
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-description"
          className="text-sm text-gray-600 dark:text-gray-400 mb-4"
          style={{ color: 'var(--color-text-secondary, #6b7280)' }}
        >
          {message}
        </p>

        {/* Bookmark Details Card */}
        {bookmarkDetails && (
          <div
            className="mb-5 p-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-bg-secondary, #f9fafb)',
              borderColor: 'var(--color-border, #e5e7eb)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-4 h-4 text-gray-900 shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span
                className="font-semibold text-sm text-gray-900"
              >
                {bookmarkDetails.surahName}
              </span>
            </div>
            <div
              className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-900"
            >
              <span>Page {bookmarkDetails.pageNumber}</span>
              <span>·</span>
              <span>{bookmarkDetails.viewMode === 'wordforword' ? 'Word by Word' : 'Mushaf'}</span>
              <span>·</span>
              <span>{formatDateTime(bookmarkDetails.createdAt)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-[var(--color-primary)] hover:opacity-90 text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  // Use portal to render at document body level to avoid stacking context issues
  return createPortal(dialogContent, document.body);
}
