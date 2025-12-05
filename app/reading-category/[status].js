// app/reading-category/[status].js
import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  Stack,
  useRouter,
  useLocalSearchParams,
  useFocusEffect,
} from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES, icons, FONT } from "../../constants";
import { ScreenHeaderBtn } from "../../components";
import { useReadingStore } from "../../hook/useReadingStore";

const COVER_FALLBACK =
  "https://t4.ftcdn.net/jpg/05/05/61/73/360_F_505617309_NN1CW7diNmGXJfMicpY9eXHKV4sqzO5H.jpg";

// Helper to make author line nice
const getAuthorLine = (authors) => {
  if (!Array.isArray(authors) || authors.length === 0) {
    return "Unknown author";
  }

  const names = authors
    .map((a) =>
      typeof a === "string"
        ? a
        : a && typeof a === "object" && "name" in a
        ? a.name
        : null
    )
    .filter(Boolean);

  return names.length > 0 ? names.join(", ") : "Unknown author";
};

const BookRow = ({ book, onPress }) => {
  const coverUrl = book.coverUrl || COVER_FALLBACK;
  const authorLine = getAuthorLine(book.authors);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        marginBottom: 12,
        alignItems: "center",
      }}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: coverUrl }}
        style={{ width: 50, height: 75, borderRadius: 4, marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "600" }}>{book.title}</Text>
        <Text style={{ color: "#666", fontSize: 12 }}>{authorLine}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Helper to build a safe path for book details
const buildBookDetailsPath = (book) => {
  const rawKey = book.workKey || "";

  // Some older stored books might still have "/works/OL12345W"
  // This strips any leading segments and takes the last part
  const cleanId = rawKey.split("/").filter(Boolean).pop();

  if (!cleanId) return null;

  return `/book-details/${cleanId}${
    book.editionKey ? `?editionKey=${book.editionKey}` : ""
  }`;
};

const ReadingCategoryScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const statusParam = (params.status || "").toString().toLowerCase();

  const {
    tbrBooks = [],
    currentlyReading,
    finishedBooks = [],
    loading,
    reload,
  } = useReadingStore();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  let title = "Books";
  let books = [];

  if (statusParam === "tbr") {
    title = "To Be Read";
    books = Array.isArray(tbrBooks) ? tbrBooks : [];
  } else if (statusParam === "reading") {
    title = "Currently Reading";
    books = currentlyReading ? [currentlyReading] : [];
  } else if (statusParam === "finished") {
    title = "Finished Books";
    books = Array.isArray(finishedBooks) ? finishedBooks : [];
  }

  const handleBookPress = (book) => {
    const path = buildBookDetailsPath(book);
    if (!path) return;
    router.push(path);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: COLORS.lightWhite },
          headerShadowVisible: false,
          headerLeft: () => (
            <ScreenHeaderBtn
              iconUrl={icons.left}
              dimension="60%"
              handlePress={() => router.back()}
            />
          ),
          headerTitle: () => (
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                marginLeft: 10, 
                fontFamily:FONT.bold
              }}
            >
              {title}
            </Text>
            )
          }}
      />

      <ScrollView
        contentContainerStyle={{
          padding: SIZES.medium,
          paddingBottom: 40,
        }}
      >
        {loading ? (
          <Text>Loading books...</Text>
        ) : books.length === 0 ? (
          <Text style={{ color: "#777" }}>No books in this list yet.</Text>
        ) : (
          books.map((book) => (
            <BookRow
              key={book.workKey + (book.finishedAt || "")}
              book={book}
              onPress={() => handleBookPress(book)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReadingCategoryScreen;
