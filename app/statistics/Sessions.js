import React, { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, Link } from "expo-router";
import { COLORS } from "../../constants";
import { useReadingStore } from "../../hook/useReadingStore";
import { ScreenHeaderBtn } from "../../components";
import {icons} from '../../constants'
import { generateMockReadingData } from "../../utils/sampleReadingData";

const __DEV_DATA__=__DEV__

export default function ReadingSessionsPage() {
//   const { readingSessions, finishedBooks, deleteReadingSession } =useReadingStore();
  const realStore = useReadingStore();
  const mock = useMemo(() => generateMockReadingData(), []);
  const router = useRouter();

  const readingSessions = __DEV_DATA__
    ? mock.readingSessions
    : realStore.readingSessions || [];

  const finishedBooks = __DEV_DATA__
    ? mock.finishedBooks
    : realStore.finishedBooks || [];

  const deleteReadingSession = realStore.deleteReadingSession;

  const last30Days = useMemo(() => {
    const cutoff =
      Date.now() - 30 * 24 * 60 * 60 * 1000;

    return readingSessions.filter((s) => {
      const t = new Date(s.date).getTime();
      return !isNaN(t) && t >= cutoff;
    });
  }, [readingSessions]);

  const bookMap = useMemo(() => {
    const map = {};
    finishedBooks.forEach((b) => {
      map[b.workKey] = b.title;
    });
    return map;
  }, [finishedBooks]);

  const confirmDelete = (id) => {
    Alert.alert(
      "Delete reading session?",
      "This will remove it from your statistics.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteReadingSession(id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <Stack.Screen
        options={{
          headerTitle: "Reading sessions",
          headerLeft: () => (
            <ScreenHeaderBtn
              iconUrl={icons.left}
              dimension="60%"
              handlePress={() => router.back()}
            />
          ),
        }}
      />

      <FlatList
        data={last30Days}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#777" }}>
            No reading sessions in last 30 days
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              padding: 12,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontWeight: "600" }}>
              {bookMap[item.workKey] || "Unknown book"}
            </Text>
            <Text style={{ fontSize: 12, color: "#666" }}>
              {item.date} · {item.pagesRead} pages
            </Text>

            <TouchableOpacity
              onPress={() => confirmDelete(item.id)}
              style={{ marginTop: 8 }}
            >
              <Text style={{ color: "#c00", fontSize: 12 }}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
