import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { COLORS, SIZES } from "../../constants";
import { useReadingStore } from "../../hook/useReadingStore";
import { generateMockReadingData } from "../../utils/sampleReadingData";
import { fillDateGaps } from "../../utils/fillDateGaps";
import { BOOK_COLOR_PALETTE } from "../../constants/chartColors";

import GlobalReadingChart from "./GlobalReadingChart";
import BookReadingChart from "./BookReadingChart";

const __DEV_DATA__ = true;

export default function Statistics() {
  const realStore = useReadingStore();
  const mock = useMemo(() => generateMockReadingData(), []);

  const readingSessions = __DEV_DATA__
    ? mock.readingSessions
    : realStore.readingSessions || [];

  const finishedBooks = __DEV_DATA__
    ? mock.finishedBooks
    : realStore.finishedBooks || [];

  const bookColorMap = useMemo(() => {
    const map = {};
    const recentBooks = finishedBooks.slice(0, 20);

    recentBooks.forEach((book, index) => {
      map[book.workKey] =
        BOOK_COLOR_PALETTE[index % BOOK_COLOR_PALETTE.length];
    });

    return map;
  }, [finishedBooks]);

  const [selectedWorkKey, setSelectedWorkKey] = useState(null);
  const [rangeDays, setRangeDays] = useState(30);

  // ---------- GLOBAL DATA ----------
  const globalResolvedData = useMemo(() => {
    if (!readingSessions || readingSessions.length === 0) return [];

    const byDay = {};

    // Aggregate pages per book per day
    readingSessions.forEach((s) => {
      const day = new Date(s.date).setHours(0, 0, 0, 0);
      if (isNaN(day)) return;

      if (!byDay[day]) byDay[day] = {};
      byDay[day][s.workKey] =
        (byDay[day][s.workKey] || 0) + (s.pagesRead || 0);
    });

    const allDays = Object.keys(byDay).map(Number);
    if (allDays.length === 0) return [];

    const start = Math.min(...allDays);
    const end = Math.max(...allDays);
    const ONE_DAY = 24 * 60 * 60 * 1000;

    const resolved = [];

    for (let d = start; d <= end; d += ONE_DAY) {
      const books = byDay[d] || {};
      const entries = Object.entries(books);

      if (entries.length === 0) {
        resolved.push({
          x: d,
          y: 0,
          workKey: null,
        });
      } else {
        entries.sort((a, b) => b[1] - a[1]);
        const [workKey, pages] = entries[0];

        resolved.push({
          x: d,
          y: pages,
          workKey,
        });
      }
    }

    return resolved;
  }, [readingSessions]);

  const rangedResolvedData = useMemo(() => {
  if (!globalResolvedData.length) return [];

  const lastDay =
    globalResolvedData[globalResolvedData.length - 1].x;

  const requestedCutoff =
    lastDay - rangeDays * 24 * 60 * 60 * 1000;

  const actualStart =
    globalResolvedData[0].x;

  const cutoff = Math.max(requestedCutoff, actualStart);

  return globalResolvedData.filter((d) => d.x >= cutoff);
}, [globalResolvedData, rangeDays]);


  const ONE_DAY = 24 * 60 * 60 * 1000;

  const globalSegments = useMemo(() => {
  if (!rangedResolvedData.length) return [];

  const segments = [];
  let current = null;
  let lastPoint = null;

  for (let i = 0; i < rangedResolvedData.length; i++) {
    const { x, y, workKey } = rangedResolvedData[i];
    const prev = rangedResolvedData[i - 1];
    const next = rangedResolvedData[i + 1];

    // ---- ZERO DAY ----
    if (y === 0 || !workKey) {
      if (current) {
        const p = { x, y: 0 };
        current.points.push(p);
        lastPoint = p;
        current = null;
      }
      continue;
    }

    const color = bookColorMap[workKey] || "#999";

    // ---- CONTINUATION ----
    if (current && current.workKey === workKey) {
      const p = { x, y };
      current.points.push(p);
      lastPoint = p;
      continue;
    }

    // ---- BOOK SWITCH / START ----
    current = {
      workKey,
      color,
      points: [],
    };
    segments.push(current);

    // connect to previous segment if previous day was non-zero
    if (prev && prev.y !== 0 && lastPoint) {
      current.points.push(lastPoint);
    } else if (prev && prev.y === 0) {
      current.points.push({
        x: x - ONE_DAY,
        y: 0,
      });
    }

    const p = { x, y };
    current.points.push(p);
    lastPoint = p;

    // end only if next day is zero
    if (next && next.y === 0) {
      const end = { x: x + ONE_DAY, y: 0 };
      current.points.push(end);
      lastPoint = end;
      current = null;
    }
  }

  return segments;
}, [rangedResolvedData, bookColorMap]);


  // ---------- BOOK DATA ----------
  const bookData = useMemo(() => {
    if (!selectedWorkKey) return [];

    const byDate = {};

    readingSessions
      .filter((s) => s.workKey === selectedWorkKey)
      .forEach((s) => {
        const t = new Date(s.date).setHours(0, 0, 0, 0);
        if (isNaN(t)) return;

        byDate[t] = (byDate[t] || 0) + (s.pagesRead || 0);
      });

    const sorted = Object.keys(byDate)
      .map((t) => ({ x: Number(t), y: byDate[t] }))
      .sort((a, b) => a.x - b.x);

    return fillDateGaps(sorted);
  }, [readingSessions, selectedWorkKey]);

  const selectedBook =
    finishedBooks.find((b) => b.workKey === selectedWorkKey) || null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <Stack.Screen
        options={{
          headerTitle: "Statistics",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: COLORS.lightWhite },
        }}
      />

      <ScrollView
        contentContainerStyle={{ padding: SIZES.medium }}
        showsVerticalScrollIndicator={false}
      >
        {__DEV_DATA__ && (
          <View
            style={{
              backgroundColor: "#FFF4CC",
              borderRadius: 6,
              padding: 8,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 12, textAlign: "center" }}>
              Showing sample data (development mode)
            </Text>
          </View>
        )}

        {/* GLOBAL CHART */}
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
          Reading activity
        </Text>

        <View
          style={{
            flexDirection: "row",
            marginBottom: 12,
          }}
        >
          {[7, 30, 365].map((d) => {
            const active = rangeDays === d;

            return (
              <TouchableOpacity
                key={d}
                onPress={() => setRangeDays(d)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 16,
                  marginRight: 8,
                  backgroundColor: active ? COLORS.tertiary : "#eee",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: active ? "#fff" : "#333",
                  }}
                >
                  {d}d
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>


        <GlobalReadingChart segments={globalSegments} />

        {/* BOOK LIST */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            marginVertical: 12,
          }}
        >
          Books
        </Text>

        {finishedBooks.map((book) => (
          <TouchableOpacity
            key={book.workKey}
            onPress={() =>
              setSelectedWorkKey((prev) =>
                prev === book.workKey ? null : book.workKey
              )
            }
            style={{
              padding: 10,
              borderRadius: 6,
              marginBottom: 6,
              backgroundColor:
                selectedWorkKey === book.workKey
                  ? COLORS.tertiary
                  : "#fff",
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                color:
                  selectedWorkKey === book.workKey ? "#fff" : "#222",
              }}
              numberOfLines={1}
            >
              {book.title}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color:
                  selectedWorkKey === book.workKey ? "#eee" : "#555",
              }}
            >
              {book.authors?.join(", ") || "Unknown author"}
            </Text>
          </TouchableOpacity>
        ))}

        {/* BOOK CHART */}
        {selectedWorkKey && (
          <BookReadingChart
            title={selectedBook?.title}
            data={bookData}
            color={bookColorMap[selectedWorkKey]}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
