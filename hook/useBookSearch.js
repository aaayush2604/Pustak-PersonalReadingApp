// hook/useBookSearch.js
import { useState } from "react";

const useBookSearch = () => {
  const [results, setResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const searchBooks = async (query) => {
    try {
      setLoadingSearch(true);
      setSearchError(null);

      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`
      );

      if (!res.ok) {
        throw new Error("Search failed");
      }

      const json = await res.json();
      const docs = Array.isArray(json.docs) ? json.docs : [];

      const mapped = docs.map((doc) => {
        const workKeyFull = doc.key || ""; // "/works/OL138052W"
        const workKey = workKeyFull.split("/").filter(Boolean).pop(); // "OL138052W"

        return {
          workKey,
          editionKey: doc.edition_key?.[0] ?? null,
          title: doc.title || "Untitled",
          author: doc.author_name?.[0] || "Unknown author",
          firstPublishYear: doc.first_publish_year || "N/A",
          coverId: doc.cover_i ?? null,
        };
      });

      setResults(mapped);
    } catch (err) {
      console.error("Book search failed:", err);
      setSearchError(err.message || "Search failed");
    } finally {
      setLoadingSearch(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setSearchError(null);
  };

  return {
    results,
    loadingSearch,
    searchError,
    searchBooks,
    clearResults,
  };
};

export default useBookSearch;
