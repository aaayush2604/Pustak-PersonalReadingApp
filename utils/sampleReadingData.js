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
  ];

  // last 30 days
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    // random reading days
    if (Math.random() > 0.4) {
      const book = books[Math.floor(Math.random() * books.length)];

      sessions.push({
        date: d.toISOString().split("T")[0],
        pagesRead: Math.floor(Math.random() * 40) + 5,
        workKey: book.workKey,
      });
    }
  }

  return {
    readingSessions: sessions,
    finishedBooks: books,
  };
};
