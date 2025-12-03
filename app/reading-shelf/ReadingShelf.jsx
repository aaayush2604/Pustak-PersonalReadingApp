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
import { COLORS, SIZES, icons } from "../../constants";
import { ScreenHeaderBtn } from "../../components";
import { useReadingStore } from "../../hook/useReadingStore";

const BookRow = ({ book, onPressAction, actionLabel }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        marginBottom: 12,
        alignItems: "center",
      }}
    >
      {book.coverUrl && (
        <Image
          source={{ uri: book.coverUrl }}
          style={{ width: 50, height: 75, borderRadius: 4, marginRight: 10 }}
        />
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "600" }}>{book.title}</Text>
        <Text style={{ color: "#666", fontSize: 12 }}>
          {book.authors?.join(", ") || "Unknown author"}
        </Text>
      </View>
      {onPressAction && (
        <TouchableOpacity
          onPress={onPressAction}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: COLORS.primary,
          }}
        >
          <Text style={{ fontSize: 12, color: COLORS.primary }}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const ReadingShelf = () => {
  const router = useRouter();
  
  const {
    tbrBooks = [],           // 👈 default to []
    currentlyReading,
    finishedBooks = [],      // 👈 default to []
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

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.lightWhite }}
    >
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
          headerTitle: "My Shelf",
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
            {/* TBR */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 8,
              }}
            >
              To Be Read
            </Text>
            {Array.isArray(tbrBooks) && tbrBooks.length === 0 ? (
              <Text style={{ marginBottom: 16, color: "#777" }}>
                No books in your TBR yet.
              </Text>
            ) : (
              <View style={{ marginBottom: 16 }}>
                {tbrBooks.map((book) => (
                  <BookRow
                    key={book.workKey}
                    book={book}
                    actionLabel="Start"
                    onPressAction={() => startBookFromTBR(book)}
                  />
                ))}
              </View>
            )}

            {/* Currently Reading */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 8,
                marginTop: 4,
              }}
            >
              Currently Reading
            </Text>
            {!currentlyReading ? (
              <Text style={{ marginBottom: 16, color: "#777" }}>
                You’re not reading anything right now.
              </Text>
            ) : (
              <View style={{ marginBottom: 16 }}>
                <BookRow book={currentlyReading} />
                <Text style={{ color: "#555", fontSize: 12 }}>
                  {currentlyReading.currentPage != null &&
                  currentlyReading.totalPages
                    ? `${currentlyReading.currentPage}/${currentlyReading.totalPages} pages`
                    : `${currentlyReading.currentPage ?? 0} pages read`}
                </Text>
              </View>
            )}

            {/* Finished */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 8,
                marginTop: 4,
              }}
            >
              Finished
            </Text>
            {Array.isArray(finishedBooks) && finishedBooks.length === 0 ? (
              <Text style={{ marginBottom: 16, color: "#777" }}>
                You haven’t finished any books yet.
              </Text>
            ) : (
              <View style={{ marginBottom: 16 }}>
                {finishedBooks.map((book) => (
                  <BookRow key={book.workKey + book.finishedAt} book={book} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReadingShelf;
