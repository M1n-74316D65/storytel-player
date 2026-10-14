import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Chapter } from '../interfaces/chapters';
import { CurrentChapterInfo } from '../contexts/AudioContext';
import { formatTime } from '../utils/helpers';

interface ChaptersPopoverProps {
  chapters: Chapter[];
  currentChapter: CurrentChapterInfo | null;
  onSelectChapter: (startTime: number) => void;
  onClose: () => void;
}

export function ChaptersPopover({
  chapters,
  currentChapter,
  onSelectChapter,
  onClose,
}: ChaptersPopoverProps) {
  const { t } = useTranslation();
  const currentChapterRef = useRef<HTMLButtonElement>(null);

  const currentNumber = currentChapter?.number ?? 1;
  const totalCount = chapters.length;

  // Auto-scroll current chapter into view on mount
  useEffect(() => {
    if (currentChapterRef.current) {
      currentChapterRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, []);

  return (
    <div
      className="absolute bottom-[80px] right-20 sm:right-32 w-[340px] max-h-[380px] bg-surface-overlay border border-white/[0.08] rounded-lg shadow-lg p-2 z-50 flex flex-col select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-white/[0.06] mb-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
          {t('player.chapters', 'Chapters')}
        </span>
        {totalCount > 0 && (
          <span className="text-xs font-medium text-ink-muted font-mono tabular-nums">
            {currentNumber} / {totalCount}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-0.5 custom-scrollbar max-h-[300px] pr-1">
        {chapters.length === 0 ? (
          <div className="text-xs text-ink-faint text-center py-8">
            {t('chapters.noChapters', 'No chapters available')}
          </div>
        ) : (
          chapters.map((ch, idx) => {
            const chNum = ch.number ?? idx + 1;
            const isCurrent = currentChapter?.number === chNum;
            const isPlayed = currentChapter ? chNum < currentNumber : false;
            const startTime = typeof ch.start === 'number' && !isNaN(ch.start)
              ? ch.start
              : chapters.slice(0, idx).reduce((total, c) => total + (c.durationInSeconds || 0), 0);

            return (
              <button
                key={idx}
                ref={isCurrent ? currentChapterRef : undefined}
                type="button"
                onClick={() => {
                  onSelectChapter(startTime);
                  onClose();
                }}
                className={`w-full h-9 px-3 rounded-md text-xs flex items-center justify-between transition-colors ${
                  isCurrent
                    ? 'bg-accent/15 text-white font-medium'
                    : isPlayed
                    ? 'text-ink-faint hover:bg-white/5 hover:text-ink-muted'
                    : 'text-ink-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                  {isCurrent ? (
                    <svg className="w-3.5 h-3.5 text-accent flex-shrink-0 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <span className="w-4 text-left font-mono text-[11px] text-ink-faint flex-shrink-0">
                      {chNum}
                    </span>
                  )}
                  <span className="truncate text-left">
                    {ch.title || `${t('chapters.chapter')} ${chNum}`}
                  </span>
                </div>
                <span className="font-mono text-[11px] opacity-70 flex-shrink-0 tabular-nums">
                  {formatTime(ch.durationInSeconds || 0)}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ChaptersPopover;
