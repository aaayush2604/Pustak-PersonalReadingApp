// hook/useReadingStore.js
import { useEffect, useState, useCallback } from "react";
import {
  defaultReadingState,
  loadReadingState,
  saveReadingState,
} from "../storage/readingStorage";

const normalizeAuthors = (authors) => {
  if (!authors) return [];

  // Already good: array of strings
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

  // If it's a single string: "Author1, Author2"
  if (typeof authors === "string") {
    return authors
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // If it's a single object { name: "..." }
  if (typeof authors === "object" && authors !== null && "name" in authors) {
    return [String(authors.name).trim()];
  }

  return [];
};


export const useReadingStore = () => {
  const [state, setState] = useState(defaultReadingState);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const loaded = await loadReadingState();
      const normalized = {
      ...loaded,
      tbrBooks: Array.isArray(loaded.tbrBooks)
        ? loaded.tbrBooks.map((b) => ({
            ...b,
            authors: normalizeAuthors(b.authors),
          }))
        : [],
      finishedBooks: Array.isArray(loaded.finishedBooks)
        ? loaded.finishedBooks.map((b) => ({
            ...b,
            authors: normalizeAuthors(b.authors),
          }))
        : [],
      currentlyReading: loaded.currentlyReading
        ? {
            ...loaded.currentlyReading,
            authors: normalizeAuthors(loaded.currentlyReading.authors),
          }
        : null,
    };


      setState(normalized);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const updateState = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveReadingState(next);
      return next;
    });
  }, []);

  // ---------- TBR ----------
  const addToTBR = useCallback(
    (book) => {
      updateState((prev) => {
        // avoid duplicates by workKey
        if (prev.tbrBooks.some((b) => b.workKey === book.workKey)) {
          return prev;
        }
        return {
          ...prev,
          tbrBooks: [book, ...prev.tbrBooks],
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

  // ---------- Currently reading ----------
  const setCurrentlyReading = useCallback(
    (book) => {
      const now = new Date().toISOString();
      updateState((prev) => ({
        ...prev,
        currentlyReading: {
          workKey: book.workKey,
          editionKey: book.editionKey,
          title: book.title,
          authors: book.authors || [],
          coverUrl: book.coverUrl,
          totalPages: book.totalPages,
          currentPage: book.currentPage || 0,
          startedAt:
            prev.currentlyReading?.workKey === book.workKey
              ? prev.currentlyReading.startedAt
              : now,
          lastUpdatedAt: now,
        },
      }));
    },
    [updateState]
  );

  const updateProgress = useCallback(
    ({ currentPage }) => {
      const now = new Date().toISOString();
      updateState((prev) => {
        if (!prev.currentlyReading) return prev;
        return {
          ...prev,
          currentlyReading: {
            ...prev.currentlyReading,
            currentPage,
            lastUpdatedAt: now,
          },
        };
      });
    },
    [updateState]
  );

  const finishCurrentBook = useCallback(
    ({ rating, notes } = {}) => {
      const now = new Date().toISOString();
      updateState((prev) => {
        if (!prev.currentlyReading) return prev;

        const finishedBook = {
          workKey: prev.currentlyReading.workKey,
          editionKey: prev.currentlyReading.editionKey,
          title: prev.currentlyReading.title,
          authors: prev.currentlyReading.authors,
          coverUrl: prev.currentlyReading.coverUrl,
          totalPages: prev.currentlyReading.totalPages,
          finishedAt: now,
          rating: rating ?? null,
          notes: notes ?? "",
        };

        return {
          ...prev,
          currentlyReading: null,
          finishedBooks: [finishedBook, ...prev.finishedBooks],
        };
      });
    },
    [updateState]
  );

  const addReadingSession = useCallback(
    ({ workKey, minutes, pagesRead }) => {
      const today = new Date().toISOString().slice(0, 10);
      updateState((prev) => ({
        ...prev,
        readingSessions: [
          { workKey, date: today, minutes, pagesRead: pagesRead ?? null },
          ...prev.readingSessions,
        ],
      }));
    },
    [updateState]
  );

  return {
    ...state,                     // exposes tbrBooks, currentlyReading, finishedBooks, readingSessions
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
