import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";

import styles from "./bookbrief.style";

const getAuthors = async (authorsArray) => {
  try {
    if (!Array.isArray(authorsArray) || authorsArray.length === 0) {
      return "Unknown Author";
    }

    const names = await Promise.all(
      authorsArray.map(async (item) => {
        try {
          const authorKey = item?.author?.key; // e.g. "/authors/OL22098A"
          if (!authorKey) return null;

          const authorId = authorKey.split("/").pop(); // "OL22098A"
          const url = `https://openlibrary.org/authors/${authorId}.json`;

          const res = await fetch(url);
          if (!res.ok) return null;

          const json = await res.json();
          const name = json?.name;
          if (typeof name === "string" || typeof name === "number") {
            return String(name);
          }
          return null;
        } catch (err) {
          console.error("Author fetch failed:", err);
          return null;
        }
      })
    );

    const validNames = names.filter(Boolean);
    return validNames.length > 0
      ? validNames.join(", ")
      : "Unknown Author";
  } catch (err) {
    console.error("getAuthors error:", err);
    return "Unknown Author";
  }
};

const BookBrief = ({ book, onAuthorsLoaded }) => {
  const [authorNames, setAuthorNames] = useState("Loading author...");

  // Covers
  const covers = book?.covers;
  const fallbackLogo =
    "https://t4.ftcdn.net/jpg/05/05/61/73/360_F_505617309_NN1CW7diNmGXJfMicpY9eXHKV4sqzO5H.jpg";

  let bookLogo = fallbackLogo;
  if (Array.isArray(covers) && covers.length > 0) {
    bookLogo = `https://covers.openlibrary.org/b/id/${covers[0]}-L.jpg`;
  }

  // Title
  const bookTitle =
    typeof book?.title === "string" || typeof book?.title === "number"
      ? String(book.title)
      : "Unknown Title";

  // Publish year
  let publishYear = "N/A";
  const rawPublish = book?.first_publish_date;

  if (typeof rawPublish === "string" || typeof rawPublish === "number") {
    publishYear = String(rawPublish);
  } else if (
    rawPublish &&
    typeof rawPublish === "object" &&
    "value" in rawPublish
  ) {
    publishYear = String(rawPublish.value ?? "N/A");
  }

  useEffect(() => {
    let isCancelled = false;

    const loadAuthors = async () => {
      const names = await getAuthors(book?.authors || []);
      if (!isCancelled) {
        setAuthorNames(names);
        if (onAuthorsLoaded) {
          onAuthorsLoaded(names);
        }
      }
    };

    loadAuthors();

    return () => {
      isCancelled = true;
    };
  }, [book?.authors, onAuthorsLoaded]);

  const authorNameList =
    typeof authorNames === "string" || typeof authorNames === "number"
      ? String(authorNames)
      : "Unknown Author";

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Image source={{ uri: bookLogo }} style={styles.logoImage} />
      </View>

      <View style={styles.bookTitleBox}>
        <Text style={styles.bookTitle}>{bookTitle}</Text>
      </View>

      <View style={styles.bookInfoBox}>
        <Text style={styles.bookName}>
          {authorNameList}
          {publishYear !== "N/A" ? " /" : ""}
        </Text>

        {publishYear !== "N/A" && (
          <View style={styles.publishYearBox}>
            <Text style={styles.publishYear}>{publishYear}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default BookBrief;
