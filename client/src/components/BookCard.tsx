import React from 'react';
import { useTranslation } from 'react-i18next';
import { buildCoverUrl, formatMicrosecondsTime } from '../utils/helpers';
import { BookShelfEntity } from '../interfaces/books';

interface BookCardProps {
  book: BookShelfEntity;
  onBookSelect: (book: BookShelfEntity) => void;
  onRemove?: (book: BookShelfEntity) => void;
  onQuickPlay?: (e: React.MouseEvent, book: BookShelfEntity) => void;
}

export function BookCard({ book, onBookSelect, onRemove, onQuickPlay }: BookCardProps) {
  const { t } = useTranslation();

  const position = book.abookMark ? book.abookMark.pos : 0;
  const totalDuration = book.abook?.time || 0;
  const remainingTime = Math.max(totalDuration - position, 0);

  const progressPercent =
    totalDuration > 0 ? Math.min(Math.max((position / totalDuration) * 100, 0), 100) : 0;

  const isFinished = book.status === 3 || (totalDuration > 0 && position >= totalDuration * 0.98);
  const isStarted = position > 0 && !isFinished;

  const coverUrl =
    book?.book?.largeCover ||
    book?.book?.largeCoverE ||
    book?.book?.cover ||
    book?.book?.coverE ||
    book?.book?.smallCover;

  return (
    <div
      onClick={() => onBookSelect(book)}
      className="group flex flex-col cursor-pointer select-none relative"
    >
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(book);
          }}
          title={t('bookshelf.remove', 'Remove from library')}
          aria-label={t('bookshelf.remove', 'Remove from library')}
          className="absolute top-1.5 right-1.5 z-20 w-7 h-7 rounded-md bg-black/70 text-ink-muted opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-white hover:bg-red-600 focus:outline-none transition-opacity flex items-center justify-center"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}

      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-surface-overlay flex items-center justify-center flex-shrink-0">
        {coverUrl ? (
          <img
            src={buildCoverUrl(coverUrl)}
            alt={book?.book?.name || ''}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <svg className="w-10 h-10 text-ink-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )}

        <div
          onClick={(e) => {
            if (onQuickPlay) {
              onQuickPlay(e, book);
            }
          }}
          className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <div className="w-11 h-11 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors">
            <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {book.abook && (
          <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-medium text-white/90 uppercase tracking-wide">
            {t('search.audiobook', 'Audiobook')}
          </span>
        )}
      </div>

      {(isStarted || isFinished) && (
        <div className="w-full h-0.5 bg-surface-overlay mt-0 overflow-hidden">
          <div
            className={`h-full ${isFinished ? 'bg-green-500' : 'bg-accent'}`}
            style={{ width: `${isFinished ? 100 : progressPercent}%` }}
          />
        </div>
      )}

      <div className="mt-2.5 min-w-0">
        <h3
          className="text-white font-medium text-sm line-clamp-2 leading-snug group-hover:text-accent transition-colors"
          title={book?.book?.name || ''}
        >
          {book?.book?.name || '—'}
        </h3>
        <p className="text-xs text-ink-muted mt-1 truncate">
          {book?.book?.authorsAsString || '—'}
        </p>
        <p className="text-[11px] text-ink-faint mt-1.5 truncate">
          {isFinished
            ? t('dashboard.filters.concluded', 'Concluded')
            : isStarted
            ? `${formatMicrosecondsTime(remainingTime, { hours: t('search.hours'), minutes: t('search.minutes') })} ${t('bookCard.remaining', 'remaining')}`
            : totalDuration > 0
            ? formatMicrosecondsTime(totalDuration, { hours: t('search.hours'), minutes: t('search.minutes') })
            : t('dashboard.filters.notStarted', 'Not started')}
        </p>
      </div>
    </div>
  );
}

export default BookCard;
