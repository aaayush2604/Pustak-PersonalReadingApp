import { useEffect, useState, useCallback } from "react";
import {
  defaultReadingState,
  loadReadingState,
  saveReadingState,
} from "../storage/readingStorage";

export const useReadingStore = () => {
  const [state, setState] = useState(defaultReadingState);
  const [loading, setLoading] = useState(true);

  // load once initially
  useEffect(() => {
    reload();
  }, []);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const loaded = await loadReadingState();
      setState(loaded);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateState = useCallback(
    (updater) => {
      setState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        saveReadingState(next); // persist
        return next;
      });
    },
    []
  );

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
          {
            workKey,
            date: today,
            minutes,
            pagesRead: pagesRead ?? null,
          },
          ...prev.readingSessions,
        ],
      }));
    },
    [updateState]
  );

  return {
    ...state,
    loading,
    reload,             
    setCurrentlyReading,
    updateProgress,
    finishCurrentBook,
    addReadingSession,
  };
};
