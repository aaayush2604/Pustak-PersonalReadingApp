import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";

import styles from "./bookbrief.style";
import { icons } from "../../../constants";

const getAuthors = async (authorsArray) => {
  try {
    if (!Array.isArray(authorsArray) || authorsArray.length === 0) {
      return "Unknown Author";
    }

    const names = await Promise.all(
      authorsArray.map(async (item) => {
        const authorKey = item?.author?.key; // "/authors/OL22098A"
        if (!authorKey) return null;

        const authorId = authorKey.split("/").pop(); // "OL22098A"
        const url = `https://openlibrary.org/authors/${authorId}.json`;

        try {
          const res = await fetch(url);
          if (!res.ok) return null;

          const json = await res.json();
          return json?.name || null;
        } catch (err) {
          console.error("Author fetch failed:", err);
          return null;
        }
      })
    );

    const validNames = names.filter(Boolean);
    return validNames.length > 0 ? validNames.join(", ") : "Unknown Author";
  } catch (err) {
    console.error("getAuthors error:", err);
    return "Unknown Author";
  }
};

const BookBrief = ({ book }) => {
  const [authorNames, setAuthorNames] = useState("Loading author...");

  // Build cover URL from last cover
  const covers = book?.covers;
  const fallbackLogo =
    "https://t4.ftcdn.net/jpg/05/05/61/73/360_F_505617309_NN1CW7diNmGXJfMicpY9eXHKV4sqzO5H.jpg";

  let bookLogo = fallbackLogo;
  if (Array.isArray(covers) && covers.length > 0) {
    bookLogo = `https://covers.openlibrary.org/b/id/${covers[0]}-L.jpg`;
  }

  const bookTitle = book?.title || "Unknown Title";
  const Publish_Year = book?.first_publish_date || "N/A";

  useEffect(() => {
    let isCancelled = false;

    const loadAuthors = async () => {
      const names = await getAuthors(book?.authors || []);
      if (!isCancelled) {
        setAuthorNames(names);
      }
    };

    loadAuthors();

    return () => {
      isCancelled = true;
    };
  }, [book?.authors]);

  const authorNameList = authorNames; // use author names as "companyName"

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Image
          source={{ uri: bookLogo }}
          style={styles.logoImage}
        />
      </View>

      <View style={styles.bookTitleBox}>
        <Text style={styles.bookTitle}>{bookTitle}</Text>
      </View>

      <View style={styles.bookInfoBox}>
        <Text style={styles.bookName}>{authorNameList} /</Text>

        <View style={styles.publishYearBox}>
          <Text style={styles.publishYear}>{Publish_Year}</Text>
        </View>
      </View>
    </View>
  );
};

export default BookBrief;
