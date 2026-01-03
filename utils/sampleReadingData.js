// utils/mockReadingData.js
export const generateMockReadingData = () => {
  const today = new Date();
  const sessions = [];

  const books = [
    {
      workKey: "book-1",
      title: "The Book Thief",
      authors: ["Markus Zusak"],
    },
    {
      workKey: "book-2",
      title: "Pachinko",
      authors: ["Min Jin Lee"],
    },
    {
      workKey: "book-3",
      title: "Mistborn",
      authors: ["Brandon Sanderson"],
    },
    {
      workKey: "book-4",
      title: "The Nightingale",
      authors: ["Kristin Hannah"],
    },
    {
      workKey: "book-5",
      title: "All the Light We Cannot See",
      authors: ["Anthony Doerr"],
    },
    {
      workKey: "book-6",
      title: "The Kite Runner",
      authors: ["Khaled Hosseini"],
    },
  ];

  /**
   * 6 months ≈ 180 days
   * Each book is read once, sequentially
   */
  const TOTAL_DAYS = 180;
  const daysPerBook = Math.floor(TOTAL_DAYS / books.length); // ~30 days

  for (let i = 0; i < TOTAL_DAYS; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    const bookIndex = Math.min(
      Math.floor(i / daysPerBook),
      books.length - 1
    );
    const book = books[bookIndex];

    // simulate occasional no-reading days
    if (Math.random() < 0.2) continue;

    sessions.push({
      date: d.toISOString().split("T")[0],
      pagesRead: Math.floor(Math.random() * 40) + 5,
      workKey: book.workKey,
    });
  }

  return {
    readingSessions: sessions,
    finishedBooks: books,
  };
};
