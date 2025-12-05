// app/statistics.js
import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { LineChart } from "react-native-chart-kit";

import { COLORS, SIZES } from "../../constants";
import { useReadingStore } from "../../hook/useReadingStore";

const screenWidth = Dimensions.get("window").width;

// Helper to format x-axis labels
const formatDateLabel = (d) => {
  d = new Date(d);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

export const Statistics = () => {
  const { readingSessions = [], finishedBooks = [] } = useReadingStore();
  const [selectedWorkKey, setSelectedWorkKey] = useState(null);

  // ---- GLOBAL graph ----
  const globalData = useMemo(() => {
    if (!readingSessions || readingSessions.length === 0) return [];

    const byDate = {};
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);

    readingSessions.forEach((s) => {
      const d = new Date(s.date);
      if (isNaN(d.getTime()) || d < cutoff) return;

      if (!byDate[s.date]) byDate[s.date] = 0;
      byDate[s.date] += s.pagesRead || 0;
    });

    return Object.keys(byDate)
      .sort()
      .map((date) => ({
        x: date,
        y: byDate[date],
      }));
  }, [readingSessions]);

  // ---- BOOK graph ----
  const bookData = useMemo(() => {
    if (!selectedWorkKey || readingSessions.length === 0) return [];

    const filtered = readingSessions.filter((s) => s.workKey === selectedWorkKey);
    const byDate = {};

    filtered.forEach((s) => {
      if (!byDate[s.date]) byDate[s.date] = 0;
      byDate[s.date] += s.pagesRead || 0;
    });

    return Object.keys(byDate)
      .sort()
      .map((date) => ({
        x: date,
        y: byDate[date],
      }));
  }, [readingSessions, selectedWorkKey]);

  const selectedBook = finishedBooks.find((b) => b.workKey === selectedWorkKey) || null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <Stack.Screen
        options={{
          headerTitle: "Statistics",
          headerStyle: { backgroundColor: COLORS.lightWhite },
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SIZES.medium }}
        showsVerticalScrollIndicator={false}
      >
        {/* GLOBAL GRAPH */}
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
          Reading activity (last 30 days)
        </Text>

        {globalData.length === 0 ? (
          <Text style={{ marginBottom: 20 }}>No reading sessions recorded yet.</Text>
        ) : (
          <LineChart
            data={{
              labels: globalData.map((d) => formatDateLabel(d.x)),
              datasets: [{ data: globalData.map((d) => d.y) }],
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: () => "#111210",
              labelColor: () => "#444",
              propsForDots: { r: "3", strokeWidth: "1" },
            }}
            bezier
            style={{
              borderRadius: 8,
              marginBottom: 24,
            }}
          />
        )}

        {/* BOOK LIST */}
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Books</Text>

        {finishedBooks.length === 0 ? (
          <Text style={{ marginBottom: 20 }}>You haven't finished any books yet.</Text>
        ) : (
          <View style={{ marginBottom: 24 }}>
            {finishedBooks.map((book) => (
              <TouchableOpacity
                key={book.workKey}
                onPress={() =>
                  setSelectedWorkKey((prev) => (prev === book.workKey ? null : book.workKey))
                }
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  marginBottom: 6,
                  borderRadius: 6,
                  backgroundColor: selectedWorkKey === book.workKey ? COLORS.tertiary : "white",
                }}
              >
                <Text
                  style={{
                    fontWeight: "600",
                    color: selectedWorkKey === book.workKey ? "white" : "#222",
                  }}
                  numberOfLines={1}
                >
                  {book.title}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: selectedWorkKey === book.workKey ? "#eee" : "#555",
                  }}
                >
                  {book.authors?.join(", ") || "Unknown author"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* BOOK GRAPH */}
        {selectedWorkKey && (
          <View style={{ marginBottom: 40 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
              Pages read per day — {selectedBook ? selectedBook.title : "Selected book"}
            </Text>

            {bookData.length === 0 ? (
              <Text>No reading sessions recorded for this book.</Text>
            ) : (
              <LineChart
                data={{
                  labels: bookData.map((d) => formatDateLabel(d.x)),
                  datasets: [{ data: bookData.map((d) => d.y) }],
                }}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `${COLORS.tertiary}${Math.floor(opacity * 255).toString(16)}`,
                  labelColor: (o = 1) => `rgba(80, 80, 80, ${o})`,
                }}
                bezier
                style={{ borderRadius: 8 }}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Statistics;
