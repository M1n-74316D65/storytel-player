import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageModal from './LanguageModal';
import { findLanguage } from '../config/languages';

interface LanguageButtonProps {
    /** `dock` matches the floating menu, `ghost` sits on a plain background, `topbar` matches top bar. */
    variant?: 'dock' | 'ghost' | 'topbar';
    className?: string;
}

/**
 * Globe button that opens the language picker.
 *
 * Rendered wherever the user might be stranded in the wrong language: the
 * floating dock, top navigation bar, and the login screen. It always shows the active language code
 * next to the globe, so the control is recognisable without reading any text.
 */
export function LanguageButton({ variant = 'dock', className = '' }: LanguageButtonProps) {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [code, setCode] = useState(i18n.language);

    useEffect(() => {
        const onChanged = (lng: string) => setCode(lng);
        i18n.on('languageChanged', onChanged);
        return () => {
            i18n.off('languageChanged', onChanged);
        };
    }, [i18n]);

    const language = findLanguage(code);
    const label = t('language.change', { language: language?.nativeName ?? code });

    const base =
        'flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40';
    const styles =
        variant === 'topbar'
            ? 'h-9 px-3 rounded-md text-ink-muted hover:text-white hover:bg-surface-overlay'
            : variant === 'dock'
            ? 'rounded-md p-2.5 text-ink-muted hover:text-white hover:bg-white/10'
            : 'rounded-md px-3 py-2 text-ink-muted hover:text-white hover:bg-white/10';

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                title={label}
                aria-label={label}
                className={`${base} ${styles} ${className}`}
            >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18 15 15 0 010-18z"
                    />
                </svg>
                <span className="text-xs font-medium tracking-wider uppercase">{code}</span>
            </button>

            <LanguageModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}

export default LanguageButton;
