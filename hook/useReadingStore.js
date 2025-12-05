// hook/useReadingStore.js
import { useEffect, useState, useCallback } from "react";
import {
  defaultReadingState,
  loadReadingState,
  saveReadingState,
} from "../storage/readingStorage";

// ------------------ HELPERS ------------------

const normalizeAuthors = (authors) => {
  if (!authors) return [];

  if (Array.isArray(authors)) {
    return authors
      .map((a) =>
        typeof a === "string"
          ? a.trim()
          : a && typeof a === "object" && "name" in a
          ? String(a.name).trim()
          : null
      )
      .filter(Boolean);
  }

  if (typeof authors === "string") {
    return authors
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (typeof authors === "object" && authors !== null && "name" in authors) {
    return [String(authors.name).trim()];
  }

  return [];
};

// Remove book from ALL lists
const removeEverywhere = (state, workKey) => ({
  ...state,
  tbrBooks: state.tbrBooks.filter((b) => b.workKey !== workKey),
  finishedBooks: state.finishedBooks.filter((b) => b.workKey !== workKey),
  currentlyReading:
    state.currentlyReading?.workKey === workKey ? null : state.currentlyReading,
});

// ------------------ MAIN HOOK ------------------

export const useReadingStore = () => {
  const [state, setState] = useState(defaultReadingState);
  const [loading, setLoading] = useState(true);

  // Load from storage
  const reload = useCallback(async () => {
    try {
      setLoading(true);

      const loaded = await loadReadingState();

      const normalized = {
        ...loaded,
        tbrBooks: (loaded.tbrBooks || []).map((b) => ({
          ...b,
          authors: normalizeAuthors(b.authors),
        })),
        finishedBooks: (loaded.finishedBooks || []).map((b) => ({
          ...b,
          authors: normalizeAuthors(b.authors),
        })),
        currentlyReading: loaded.currentlyReading
          ? {
              ...loaded.currentlyReading,
              authors: normalizeAuthors(loaded.currentlyReading.authors),
            }
          : null,
        readingSessions: loaded.readingSessions || [],
      };

      setState(normalized);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const updateState = useCallback((fn) => {
    setState((prev) => {
      const nextState = fn(prev);
      saveReadingState(nextState);
      return nextState;
    });
  }, []);

  // ------------------ TBR ------------------

  const addToTBR = useCallback(
    (book) => {
      updateState((prev) => {
        const b = { ...book, authors: normalizeAuthors(book.authors) };

        const cleaned = removeEverywhere(prev, b.workKey);

        // already in TBR? skip
        if (cleaned.tbrBooks.some((x) => x.workKey === b.workKey)) return cleaned;

        return {
          ...cleaned,
          tbrBooks: [b, ...cleaned.tbrBooks],
        };
      });
    },
    [updateState]
  );

  const removeFromTBR = useCallback(
    (workKey) => {
      updateState((prev) => ({
        ...prev,
        tbrBooks: prev.tbrBooks.filter((b) => b.workKey !== workKey),
      }));
    },
    [updateState]
  );

  // ------------------ CURRENTLY READING ------------------

  const setCurrentlyReading = useCallback(
    (book) => {
      updateState((prev) => {
        const now = new Date().toISOString();
        const b = { ...book, authors: normalizeAuthors(book.authors) };

        const cleaned = removeEverywhere(prev, b.workKey);

        const already = cleaned.currentlyReading?.workKey === b.workKey;

        return {
          ...cleaned,
          currentlyReading: {
            workKey: b.workKey,
            editionKey: b.editionKey,
            title: b.title,
            authors: b.authors,
            coverUrl: b.coverUrl,
            totalPages: b.totalPages,
            currentPage: b.currentPage ?? 0,
            startedAt: already
              ? cleaned.currentlyReading.startedAt
              : now,
            lastUpdatedAt: now,
          },
        };
      });
    },
    [updateState]
  );

  // ------------------ UPDATE PROGRESS ------------------

  const updateProgress = useCallback(
    ({ currentPage, totalPages }) => {
      updateState((prev) => {
        if (!prev.currentlyReading) return prev;

        const now = new Date().toISOString();
        const today = now.slice(0, 10);

        const prevPage = prev.currentlyReading.currentPage;
        const newPage =
          currentPage === "" || currentPage === undefined
            ? prevPage
            : Number(currentPage);

        const pagesRead = Math.max(newPage - prevPage, 0);

        let sessions = [...prev.readingSessions];

        if (pagesRead > 0) {
          const i = sessions.findIndex(
            (s) =>
              s.workKey === prev.currentlyReading.workKey &&
              s.date === today
          );

          if (i !== -1) {
            sessions[i] = {
              ...sessions[i],
              pagesRead: sessions[i].pagesRead + pagesRead,
            };
          } else {
            sessions.unshift({
              workKey: prev.currentlyReading.workKey,
              date: today,
              pagesRead,
            });
          }
        }

        return {
          ...prev,
          currentlyReading: {
            ...prev.currentlyReading,
            currentPage: newPage,
            totalPages: totalPages ?? prev.currentlyReading.totalPages,
            lastUpdatedAt: now,
          },
          readingSessions: sessions,
        };
      });
    },
    [updateState]
  );

  // ------------------ FINISH BOOK ------------------

  const finishCurrentBook = useCallback(
    ({ rating, notes } = {}) => {
      updateState((prev) => {
        if (!prev.currentlyReading) return prev;

        const now = new Date().toISOString();

        const finishedBook = {
          ...prev.currentlyReading,
          finishedAt: now,
          rating: rating ?? null,
          notes: notes ?? "",
        };

        return {
          ...prev,
          currentlyReading: null,
          finishedBooks: [
            finishedBook,
            ...prev.finishedBooks.filter(
              (b) => b.workKey !== finishedBook.workKey
            ),
          ],
        };
      });
    },
    [updateState]
  );

  // ------------------ READING SESSION (manual add) ------------------

  const addReadingSession = useCallback(
    ({ workKey, pagesRead, date }) => {
      const today = date ?? new Date().toISOString().slice(0, 10);

      updateState((prev) => {
        const sessions = [...prev.readingSessions];

        const idx = sessions.findIndex(
          (s) => s.workKey === workKey && s.date === today
        );

        if (idx !== -1) {
          sessions[idx] = {
            ...sessions[idx],
            pagesRead: sessions[idx].pagesRead + pagesRead,
          };
        } else {
          sessions.unshift({ workKey, date: today, pagesRead });
        }

        return { ...prev, readingSessions: sessions };
      });
    },
    [updateState]
  );

  // ------------------ EXPORT ------------------

  return {
    ...state,
    loading,
    reload,
    addToTBR,
    removeFromTBR,
    setCurrentlyReading,
    updateProgress,
    finishCurrentBook,
    addReadingSession,
  };
};
