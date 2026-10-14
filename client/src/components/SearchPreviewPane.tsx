import React from 'react';
import { useTranslation } from 'react-i18next';
import { SearchResultBook } from '../interfaces/books';
import { buildCoverUrl, formatMicrosecondsTime, localizedLanguageName } from '../utils/helpers';

interface SearchPreviewPaneProps {
  book: SearchResultBook | null;
  onPlay: (bookId: string) => void;
  onAddToLibrary: (bookId: string) => void;
  isAdded: boolean;
  isAdding: boolean;
}

export function SearchPreviewPane({
  book,
  onPlay,
  onAddToLibrary,
  isAdded,
  isAdding,
}: SearchPreviewPaneProps) {
  const { t, i18n } = useTranslation();

  if (!book) {
    return (
      <aside className="w-[340px] p-6 bg-surface-base border-l border-white/[0.06] flex flex-col items-center justify-center text-center flex-shrink-0 select-none">
        <p className="text-sm text-ink-muted">{t('search.selectBookHint', 'Select a book to preview')}</p>
      </aside>
    );
  }

  const durationText =
    book.durationMs > 0
      ? formatMicrosecondsTime(book.durationMs * 1000, {
          hours: t('search.hours'),
          minutes: t('search.minutes'),
        })
      : '—';
  const languageLabel = book.language
    ? localizedLanguageName(book.language, i18n.language, book.languageName)
    : (book.languageName ? (book.languageName.charAt(0).toUpperCase() + book.languageName.slice(1)) : '—');

  return (
    <aside className="w-[340px] p-6 bg-surface-base border-l border-white/[0.06] flex flex-col flex-shrink-0 select-none overflow-y-auto custom-scrollbar">
      <div className="w-[168px] h-[168px] rounded-lg mx-auto overflow-hidden bg-surface-overlay flex-shrink-0 mb-5">
        {book.coverUrl ? (
          <img
            src={buildCoverUrl(book.coverUrl)}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-faint">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
      </div>

      <div className="text-center mb-5">
        <h2 className="text-lg font-semibold text-white leading-snug line-clamp-2">
          {book.title}
        </h2>
        <p className="text-sm text-ink-muted mt-1 line-clamp-1">
          {book.authors}
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => onPlay(book.id)}
          className="flex-1 h-10 rounded-md bg-accent hover:bg-accent-hover text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>{t('bookView.listen', 'Listen')}</span>
        </button>

        <button
          type="button"
          onClick={() => onAddToLibrary(book.id)}
          disabled={isAdded || isAdding}
          className={`h-10 px-3 rounded-md border font-medium text-xs flex items-center gap-1.5 transition-colors ${
            isAdded
              ? 'bg-green-600/15 text-green-400 border-green-500/30 cursor-default'
              : isAdding
              ? 'bg-surface-overlay text-white border-white/15 animate-pulse'
              : 'bg-surface-overlay hover:bg-white/[0.06] text-white border-white/[0.08]'
          }`}
        >
          {isAdded ? (
            <>
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('bookView.inLibrary', 'In Library')}</span>
            </>
          ) : isAdding ? (
            <span>{t('common.saving', 'Saving...')}</span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{t('bookView.addToLibrary', 'Add to Library')}</span>
            </>
          )}
        </button>
      </div>

      <div className="border-t border-b border-white/[0.06] divide-y divide-white/[0.04] py-1 text-sm mb-5">
        <div className="py-2.5 flex items-center justify-between">
          <span className="text-ink-faint">{t('bookView.language', 'Language')}</span>
          <span className="text-gray-200">{languageLabel}</span>
        </div>
        <div className="py-2.5 flex items-center justify-between">
          <span className="text-ink-faint">{t('bookView.duration', 'Duration')}</span>
          <span className="text-gray-200">{durationText}</span>
        </div>
        {book.narrators && (
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-ink-faint">{t('bookView.narrator', 'Narrator')}</span>
            <span className="text-gray-200 truncate max-w-[170px] text-right" title={book.narrators}>
              {book.narrators}
            </span>
          </div>
        )}
        {book.category && (
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-ink-faint">{t('bookView.category', 'Category')}</span>
            <span className="text-gray-200 truncate max-w-[170px] text-right" title={book.category}>
              {book.category}
            </span>
          </div>
        )}
      </div>

      {book.description && (
        <div>
          <h4 className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
            {t('bookView.description', 'Description')}
          </h4>
          <p className="text-sm leading-relaxed text-ink-muted">
            {book.description}
          </p>
        </div>
      )}
    </aside>
  );
}

export default SearchPreviewPane;
