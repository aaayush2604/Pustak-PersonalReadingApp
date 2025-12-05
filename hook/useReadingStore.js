// hook/useReadingStore.js
import { useEffect, useState, useCallback } from "react";
import {
  defaultReadingState,
  loadReadingState,
  saveReadingState,
} from "../storage/readingStorage";

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
      const next =
        typeof updater === "function" ? updater(prev) : updater;
      saveReadingState(next);
      return next;
    });
  }, []);

  // ---------- TBR ----------
  const addToTBR = useCallback(
    (book) => {
      updateState((prev) => {
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

  // ----------- UPDATE PROGRESS (final correct version) ------------
  const updateProgress = useCallback(
    ({ currentPage, totalPages }) => {
      const now = new Date().toISOString();
      const today = now.slice(0, 10);

      updateState((prev) => {
        if (!prev.currentlyReading) return prev;

        const prevPage = prev.currentlyReading.currentPage;

        const newPage =
          currentPage === undefined ||
          currentPage === null ||
          currentPage === ""
            ? prevPage
            : Number(currentPage);

        const pagesRead = Math.max(newPage - prevPage, 0);

        console.log("SESSION CHECK:", {
          prevPage,
          newPage,
          pagesRead,
        });

        let updatedSessions = [...prev.readingSessions];

        if (pagesRead > 0) {
          const existingIndex = updatedSessions.findIndex(
            (s) => s.workKey === prev.currentlyReading.workKey && s.date === today
          );

          if (existingIndex !== -1) {
            updatedSessions[existingIndex] = {
              ...updatedSessions[existingIndex],
              pagesRead:
                updatedSessions[existingIndex].pagesRead + pagesRead,
            };
          } else {
            updatedSessions.unshift({
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
          readingSessions: updatedSessions,
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
    ({ workKey, pagesRead, date }) => {
      const today = date ?? new Date().toISOString().slice(0, 10);
      updateState((prev) => ({
        ...prev,
        readingSessions: [
          { workKey, date: today, pagesRead },
          ...(prev.readingSessions || []),
        ],
      }));
    },
    [updateState]
  );

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
