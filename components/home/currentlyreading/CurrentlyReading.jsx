// components/currently-reading/CurrentlyReading.jsx
import React, { useState,useCallback } from "react";
import { View, Text, Image, TextInput, Button } from "react-native";
import { useReadingStore } from "../../../hook/useReadingStore";
import { useFocusEffect } from "expo-router";

const CurrentlyReading = () => {
  const {
    currentlyReading,
    loading,
    reload,
    updateProgress,
    finishCurrentBook,
  } = useReadingStore();

  const [pageInput, setPageInput] = useState("");

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  if (loading) {
    return (
      <View>
        <Text>Loading reading data...</Text>
      </View>
    );
  }

  if (!currentlyReading) {
    return (
      <View>
        <Text>No book currently reading.</Text>
      </View>
    );
  }

  const progressText =
    currentlyReading.totalPages && currentlyReading.currentPage != null
      ? `${currentlyReading.currentPage}/${currentlyReading.totalPages} pages`
      : `${currentlyReading.currentPage ?? 0} pages read`;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
        Currently Reading
      </Text>

      {currentlyReading.coverUrl && (
        <Image
          source={{ uri: currentlyReading.coverUrl }}
          style={{ width: 120, height: 180, marginBottom: 8 }}
        />
      )}

      <Text style={{ fontSize: 16, fontWeight: "600" }}>
        {currentlyReading.title}
      </Text>
      <Text style={{ color: "#555" }}>
        {currentlyReading.authors?.join(", ") || "Unknown author"}
      </Text>
      <Text style={{ marginTop: 4 }}>{progressText}</Text>

      <View style={{ flexDirection: "row", marginTop: 8, alignItems: "center" }}>
        <Text>Update page: </Text>
        <TextInput
          value={pageInput}
          onChangeText={setPageInput}
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            paddingHorizontal: 8,
            paddingVertical: 4,
            width: 80,
            marginRight: 8,
          }}
        />
        <Button
          title="Save"
          onPress={() => {
            const pageNum = parseInt(pageInput, 10);
            if (!isNaN(pageNum)) {
              updateProgress({ currentPage: pageNum });
            }
          }}
        />
      </View>

      <View style={{ marginTop: 12 }}>
        <Button
          title="Mark as Finished"
          onPress={() => finishCurrentBook()}
        />
      </View>
    </View>
  );
};

export default CurrentlyReading;
