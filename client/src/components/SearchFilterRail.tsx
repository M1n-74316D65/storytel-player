import React from 'react';
import { useTranslation } from 'react-i18next';

export interface LanguageStat {
  iso: string;
  name: string;
  count: number;
}

export type DurationFilter = 'all' | 'under5' | '5to15' | 'over15';

interface SearchFilterRailProps {
  languageStats: LanguageStat[];
  selectedLanguages: string[]; // empty array means all
  onToggleLanguage: (iso: string) => void;
  onSelectAllLanguages: () => void;
  selectedDuration: DurationFilter;
  onChangeDuration: (duration: DurationFilter) => void;
  totalHits: number;
}

export function SearchFilterRail({
  languageStats,
  selectedLanguages,
  onToggleLanguage,
  onSelectAllLanguages,
  selectedDuration,
  onChangeDuration,
  totalHits,
}: SearchFilterRailProps) {
  const { t } = useTranslation();

  const isAllLanguagesSelected = selectedLanguages.length === 0;

  return (
    <aside className="w-[248px] p-5 gap-6 border-r border-white/[0.06] bg-surface-base flex flex-col flex-shrink-0 select-none overflow-y-auto custom-scrollbar">
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
            {t('search.filterByLanguage', 'Language')}
          </span>
          {!isAllLanguagesSelected && (
            <button
              type="button"
              onClick={onSelectAllLanguages}
              className="text-[11px] font-medium text-accent hover:text-accent-hover transition-colors"
            >
              {t('search.showAllLanguages', { total: totalHits })}
            </button>
          )}
        </div>

        <div className="space-y-0.5">
          <button
            type="button"
            onClick={onSelectAllLanguages}
            className={`w-full h-9 px-2.5 rounded-md flex items-center justify-between text-xs font-medium transition-colors ${
              isAllLanguagesSelected
                ? 'bg-surface-overlay text-white'
                : 'text-ink-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                  isAllLanguagesSelected
                    ? 'bg-accent text-white'
                    : 'border border-white/25'
                }`}
              >
                {isAllLanguagesSelected && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="truncate">{t('search.allLanguages', 'All')}</span>
            </div>
            <span className="text-[11px] tabular-nums text-ink-faint">
              {totalHits}
            </span>
          </button>

          {languageStats.map((stat) => {
            const isSelected = selectedLanguages.includes(stat.iso.toLowerCase());
            return (
              <button
                key={stat.iso}
                type="button"
                onClick={() => onToggleLanguage(stat.iso)}
                className={`w-full h-9 px-2.5 rounded-md flex items-center justify-between text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-surface-overlay text-white'
                    : 'text-ink-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-accent text-white'
                        : 'border border-white/25'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="truncate">{stat.name}</span>
                </div>
                <span className="text-[11px] tabular-nums text-ink-faint">
                  {stat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
            {t('search.filterByLength', 'Length')}
          </span>
        </div>
        <div className="space-y-0.5">
          {[
            { id: 'all' as DurationFilter, label: t('search.allLengths', 'All lengths') },
            { id: 'under5' as DurationFilter, label: `< 5 ${t('search.hours')}` },
            { id: '5to15' as DurationFilter, label: `5–15 ${t('search.hours')}` },
            { id: 'over15' as DurationFilter, label: `> 15 ${t('search.hours')}` },
          ].map((dur) => {
            const isSelected = selectedDuration === dur.id;
            return (
              <button
                key={dur.id}
                type="button"
                onClick={() => onChangeDuration(dur.id)}
                className={`w-full h-9 px-2.5 rounded-md flex items-center gap-2.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-surface-overlay text-white'
                    : 'text-ink-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? 'border-[5px] border-accent'
                      : 'border border-white/25'
                  }`}
                />
                <span className="truncate">{dur.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default SearchFilterRail;
