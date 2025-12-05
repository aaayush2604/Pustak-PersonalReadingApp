// app/reading-shelf.js
import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { COLORS, SIZES, icons, FONT } from "../../constants";
import { ScreenHeaderBtn } from "../../components";
import { useReadingStore } from "../../hook/useReadingStore";

const COVER_FALLBACK =
  "https://t4.ftcdn.net/jpg/05/05/61/73/360_F_505617309_NN1CW7diNmGXJfMicpY9eXHKV4sqzO5H.jpg";

const CoverStrip = ({ books }) => {
  if (!Array.isArray(books) || books.length === 0) {
    return (
      <Text style={{ color: "#777", marginTop: 4 }}>
        No books here yet.
      </Text>
    );
  }

  const topBooks = books.slice(0, 4);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 4 }}
    >
      {topBooks.map((book) => {
        const uri = book.coverUrl || COVER_FALLBACK;
        return (
          <View
            key={book.workKey + (book.finishedAt || "")}
            style={{ marginRight: 8 }}
          >
            <Image
              source={{ uri }}
              style={{ width: 60, height: 90, borderRadius: 4 }}
            />
          </View>
        );
      })}
    </ScrollView>
  );
};

const ReadingShelf = () => {
  const router = useRouter();

  const {
    tbrBooks = [],
    currentlyReading,
    finishedBooks = [],
    loading,
    reload,
    setCurrentlyReading,
    removeFromTBR,
  } = useReadingStore();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const startBookFromTBR = (book) => {
    setCurrentlyReading({
      workKey: book.workKey,
      editionKey: book.editionKey,
      title: book.title,
      authors: book.authors,
      coverUrl: book.coverUrl,
      totalPages: book.totalPages,
      currentPage: 0,
    });
    removeFromTBR(book.workKey);
  };

  // We'll still keep the "Start" behavior for TBR,
  // but now user will mostly go to /reading-category/tbr for the full list.
  // On this overview screen we just show cover strip.

  // Build arrays for each section
  const tbrList = Array.isArray(tbrBooks) ? tbrBooks : [];
  const readingList = currentlyReading ? [currentlyReading] : [];
  const finishedList = Array.isArray(finishedBooks) ? finishedBooks : [];

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
              My Shelf
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
          <Text>Loading shelf...</Text>
        ) : (
          <>
            {/* TBR Section */}
            <TouchableOpacity
              onPress={() => router.push("/reading-category/tbr")}
              activeOpacity={0.8}
              style={{
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 8,
                }}
              >
                To Be Read
              </Text>
              <CoverStrip books={tbrList} />
            </TouchableOpacity>

            {/* Currently Reading Section */}
            <TouchableOpacity
              onPress={() => router.push("/reading-category/reading")}
              activeOpacity={0.8}
              style={{
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 8,
                }}
              >
                Currently Reading
              </Text>
              <CoverStrip books={readingList} />
            </TouchableOpacity>

            {/* Finished Section */}
            <TouchableOpacity
              onPress={() => router.push("/reading-category/finished")}
              activeOpacity={0.8}
              style={{
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 8,
                }}
              >
                Finished
              </Text>
              <CoverStrip books={finishedList} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReadingShelf;
