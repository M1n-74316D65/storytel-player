import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  maxWidth?: string; // e.g. 'max-w-md', 'max-w-4xl'
  zIndex?: number;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  headerActions,
  maxWidth = 'max-w-md',
  zIndex = 50
}) => {
  // Called before the early return so the hook order stays stable.
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center"
      style={{ zIndex }}
      onClick={onClose}
    >
      <div
        className={`bg-surface-raised rounded-lg p-0 w-full ${maxWidth} mx-4 border border-white/[0.08] max-h-[90vh] flex flex-col shadow-lg overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {(title || onClose || headerActions) && (
          <div className="px-5 py-3.5 border-b border-white/[0.06] bg-surface-raised sticky top-0 flex flex-col gap-3 shrink-0">
            <div className="flex justify-between items-center gap-4">
              {title && (
                <h2 className="text-lg font-semibold text-white flex-1 min-w-0">
                  {title}
                </h2>
              )}
              <div className="flex gap-2 items-center shrink-0">
                {headerActions}

                {onClose && (
                  <>
                    {headerActions && <div className="w-px h-5 bg-white/10 my-auto mx-1"></div>}
                    <button
                      onClick={onClose}
                      className="p-1.5 text-ink-muted hover:text-white hover:bg-white/10 rounded-md transition-colors"
                      title={t('common.close', 'Close')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
