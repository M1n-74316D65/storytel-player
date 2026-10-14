import React from 'react';
import { useTranslation } from 'react-i18next';
import { SearchResultBook } from '../interfaces/books';
import { buildCoverUrl, formatMicrosecondsTime } from '../utils/helpers';

export type SortOption = 'relevance' | 'title' | 'duration';

interface SearchResultListProps {
  results: SearchResultBook[];
  totalRawHits: number;
  selectedBookId: string | null;
  onSelectBook: (book: SearchResultBook) => void;
  onPlayBook: (e: React.MouseEvent, bookId: string) => void;
  onAddToLibrary: (e: React.MouseEvent, bookId: string) => void;
  addedBooks: Record<string, boolean>;
  addingBookId: string | null;
  sortBy: SortOption;
  onChangeSort: (sort: SortOption) => void;
}

export function SearchResultList({
  results,
  totalRawHits,
  selectedBookId,
  onSelectBook,
  onPlayBook,
  onAddToLibrary,
  addedBooks,
  addingBookId,
  sortBy,
  onChangeSort,
}: SearchResultListProps) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-surface-base overflow-hidden">
      <div className="h-[46px] px-6 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0 select-none">
        <span className="text-xs font-medium text-ink-muted">
          {results.length === totalRawHits
            ? t('search.hitCount', { count: results.length })
            : t('search.hitCountFiltered', { count: results.length, total: totalRawHits })}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-ink-faint font-medium">{t('search.sortLabel', 'Sort:')}</span>
          <select
            value={sortBy}
            onChange={(e) => onChangeSort(e.target.value as SortOption)}
            className="h-7 px-2.5 rounded-md bg-surface-overlay border border-white/[0.08] text-xs text-gray-200 outline-none focus:border-accent/70"
          >
            <option value="relevance">{t('search.sortRelevance', 'Most relevant')}</option>
            <option value="title">{t('search.sortTitle', 'Title (A–Z)')}</option>
            <option value="duration">{t('search.sortDuration', 'Longest first')}</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5 custom-scrollbar">
        {results.map((book) => {
          const isSelected = selectedBookId === book.id;
          const isAdded = addedBooks[book.id];
          const isAdding = addingBookId === book.id;
          const durationText =
            book.durationMs > 0
              ? formatMicrosecondsTime(book.durationMs * 1000, {
                  hours: t('search.hours'),
                  minutes: t('search.minutes'),
                })
              : '';

          return (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className={`group flex items-center gap-3 p-2.5 rounded-md transition-colors cursor-pointer select-none ${
                isSelected
                  ? 'bg-surface-overlay'
                  : 'hover:bg-white/[0.04]'
              }`}
            >
              <div className="w-14 h-14 rounded-md bg-surface-overlay overflow-hidden flex-shrink-0 relative">
                {book.coverUrl ? (
                  <img
                    src={buildCoverUrl(book.coverUrl)}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink-faint">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  {book.hasAbook && (
                    <span className="text-[10px] uppercase font-medium text-accent">
                      {t('search.audiobook', 'Audiobook')}
                    </span>
                  )}
                  {book.hasEbook && (
                    <span className="text-[10px] uppercase font-medium text-ink-muted">
                      {t('search.ebook', 'E-book')}
                    </span>
                  )}
                  {book.language && (
                    <span className="text-[10px] uppercase font-medium text-ink-faint">
                      {book.language.toUpperCase()}
                    </span>
                  )}
                  {durationText && (
                    <span className="text-xs text-ink-faint ml-0.5">
                      {durationText}
                    </span>
                  )}
                  {book.category && (
                    <span className="text-xs text-ink-faint truncate max-w-[120px]">
                      · {book.category}
                    </span>
                  )}
                </div>

                <h3 className={`text-sm font-medium truncate transition-colors ${isSelected ? 'text-accent' : 'text-white group-hover:text-accent'}`}>
                  {book.title}
                </h3>

                <p className="text-xs text-ink-muted truncate mt-0.5">
                  {book.authors}
                  {book.narrators && ` · ${book.narrators}`}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={(e) => onAddToLibrary(e, book.id)}
                  title={isAdded ? t('search.addedToBookshelf', 'Added to Library') : t('search.addToBookshelf', 'Add to Library')}
                  disabled={isAdded || isAdding}
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                    isAdded
                      ? 'text-green-400 cursor-default'
                      : isAdding
                      ? 'text-white animate-pulse'
                      : 'text-ink-muted hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isAdded ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isAdding ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => onPlayBook(e, book.id)}
                  title={t('search.play', 'Play')}
                  className={`h-8 px-3 rounded-md font-medium text-xs flex items-center gap-1.5 transition-colors ${
                    isSelected
                      ? 'bg-accent hover:bg-accent-hover text-white'
                      : 'bg-white/10 hover:bg-accent text-white'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>{t('search.play', 'Play')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SearchResultList;
