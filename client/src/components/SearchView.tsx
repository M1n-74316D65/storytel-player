import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import { SearchResultBook, SearchResponse } from '../interfaces/books';
import { addToBookshelfErrorKey, localizedLanguageName, searchResultToBookEntity } from '../utils/helpers';
import SearchFilterRail, { DurationFilter, LanguageStat } from './SearchFilterRail';
import SearchResultList, { SortOption } from './SearchResultList';
import SearchPreviewPane from './SearchPreviewPane';

interface SearchViewProps {
  query?: string;
}

export function SearchView({ query: propQuery }: SearchViewProps) {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeQuery = propQuery !== undefined ? propQuery : (searchParams.get('q') || '');

  const [rawResults, setRawResults] = useState<SearchResultBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<SearchResultBook | null>(null);

  // Filters state
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]); // empty = all
  const [selectedDuration, setSelectedDuration] = useState<DurationFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  // Book actions state
  const [addedBooks, setAddedBooks] = useState<Record<string, boolean>>({});
  const [addingBookId, setAddingBookId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Perform backend search
  const performSearch = async (searchTerm: string) => {
    const q = searchTerm.trim();
    if (!q) {
      setRawResults([]);
      setSelectedBook(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.get<SearchResponse>(`/search?q=${encodeURIComponent(q)}`);
      const results = res.data?.results || [];
      setRawResults(results);
      if (results.length > 0) {
        setSelectedBook(results[0]);
      } else {
        setSelectedBook(null);
      }
    } catch (err) {
      console.error('Catalog search failed:', err);
      setRawResults([]);
      setSelectedBook(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!activeQuery.trim()) {
      setRawResults([]);
      setSelectedBook(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(() => {
      performSearch(activeQuery);
    }, 250);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [activeQuery]);

  // Compute language breakdown stats
  const languageStats = useMemo<LanguageStat[]>(() => {
    const counts: Record<string, { iso: string; name: string; count: number }> = {};
    for (const book of rawResults) {
      if (!book.language) continue;
      const iso = book.language.toLowerCase();
      const name = localizedLanguageName(iso, i18n.language, book.languageName) || iso.toUpperCase();
      if (!counts[iso]) {
        counts[iso] = { iso, name, count: 0 };
      }
      counts[iso].count += 1;
    }
    return Object.values(counts);
  }, [rawResults, i18n.language]);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let list = [...rawResults];

    // 1. Language Filter
    if (selectedLanguages.length > 0) {
      list = list.filter((b) => selectedLanguages.includes((b.language || '').toLowerCase()));
    }

    // 2. Duration Filter
    if (selectedDuration === 'under5') {
      list = list.filter((b) => b.durationMs > 0 && b.durationMs < 5 * 3600 * 1000);
    } else if (selectedDuration === '5to15') {
      list = list.filter(
        (b) => b.durationMs >= 5 * 3600 * 1000 && b.durationMs <= 15 * 3600 * 1000
      );
    } else if (selectedDuration === 'over15') {
      list = list.filter((b) => b.durationMs > 15 * 3600 * 1000);
    }

    // 3. Sort
    if (sortBy === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'duration') {
      list.sort((a, b) => b.durationMs - a.durationMs);
    }

    return list;
  }, [rawResults, selectedLanguages, selectedDuration, sortBy]);

  // Keep selectedBook valid after filter changes
  useEffect(() => {
    if (filteredResults.length > 0) {
      if (!selectedBook || !filteredResults.some((b) => b.id === selectedBook.id)) {
        setSelectedBook(filteredResults[0]);
      }
    } else {
      setSelectedBook(null);
    }
  }, [filteredResults, selectedBook]);

  const handleToggleLanguage = (iso: string) => {
    const code = iso.toLowerCase();
    setSelectedLanguages((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const handlePlayBook = (e: React.MouseEvent | null, bookId: string) => {
    if (e) e.stopPropagation();
    const targetBook = rawResults.find((b) => b.id === bookId) || (selectedBook?.id === bookId ? selectedBook : null);
    const entity = targetBook ? searchResultToBookEntity(targetBook) : null;
    navigate(`/player/${bookId}`, { state: { book: entity, autoPlay: true } });
  };

  const handleAddToLibrary = async (e: React.MouseEvent | null, bookId: string) => {
    if (e) e.stopPropagation();
    if (addedBooks[bookId] || addingBookId === bookId) return;

    try {
      setAddingBookId(bookId);
      await api.post('/bookshelf/add', { consumableId: bookId });
      setAddedBooks((prev) => ({ ...prev, [bookId]: true }));
      window.dispatchEvent(new Event('bookshelfUpdated'));
      setToastMessage({
        type: 'success',
        text: t('search.addedToBookshelf', 'Added to Library'),
      });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to add book to library:', err);
      setToastMessage({
        type: 'error',
        text: t(addToBookshelfErrorKey(err)),
      });
      setTimeout(() => setToastMessage(null), 4500);
    } finally {
      setAddingBookId(null);
    }
  };

  return (
    <div className="flex h-full w-full bg-surface-base overflow-hidden relative select-none">
      {toastMessage && (
        <div
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-md text-xs font-medium flex items-center gap-2 border ${
            toastMessage.type === 'success'
              ? 'bg-surface-overlay text-green-300 border-green-800/60'
              : 'bg-surface-overlay text-red-300 border-red-800/60'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <SearchFilterRail
        languageStats={languageStats}
        selectedLanguages={selectedLanguages}
        onToggleLanguage={handleToggleLanguage}
        onSelectAllLanguages={() => setSelectedLanguages([])}
        selectedDuration={selectedDuration}
        onChangeDuration={setSelectedDuration}
        totalHits={rawResults.length}
      />

      {isLoading && rawResults.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface-base">
          <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-ink-muted">{t('search.searching', 'Searching...')}</p>
        </div>
      ) : !activeQuery.trim() ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface-base">
          <h3 className="text-base font-medium text-white mb-1">{t('search.title', 'Search Storytel')}</h3>
          <p className="text-sm text-ink-faint max-w-sm">
            {t('search.initialPrompt', "Type to search Storytel's vast catalog of audiobooks")}
          </p>
        </div>
      ) : rawResults.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface-base">
          <h3 className="text-base font-medium text-white mb-1">
            {t('search.noResults', 'No books found for')} ”{activeQuery}”
          </h3>
          <p className="text-sm text-ink-faint max-w-sm">
            {t('search.noResultsHint', 'Check the spelling or try another search term')}
          </p>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface-base">
          <h3 className="text-sm font-medium text-white mb-2">{t('search.noFilterMatch', 'No matches with the selected filters')}</h3>
          <button
            type="button"
            onClick={() => {
              setSelectedLanguages([]);
              setSelectedDuration('all');
            }}
            className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors"
          >
            {t('search.showAllLanguages', { total: rawResults.length })}
          </button>
        </div>
      ) : (
        <SearchResultList
          results={filteredResults}
          totalRawHits={rawResults.length}
          selectedBookId={selectedBook?.id || null}
          onSelectBook={(book) => setSelectedBook(book)}
          onPlayBook={(e, id) => handlePlayBook(e, id)}
          onAddToLibrary={(e, id) => handleAddToLibrary(e, id)}
          addedBooks={addedBooks}
          addingBookId={addingBookId}
          sortBy={sortBy}
          onChangeSort={setSortBy}
        />
      )}

      {/* 3. Right: Preview Pane (340px) */}
      <SearchPreviewPane
        book={selectedBook}
        onPlay={(id) => handlePlayBook(null, id)}
        onAddToLibrary={(id) => handleAddToLibrary(null, id)}
        isAdded={selectedBook ? !!addedBooks[selectedBook.id] : false}
        isAdding={selectedBook ? addingBookId === selectedBook.id : false}
      />
    </div>
  );
}

export default SearchView;
