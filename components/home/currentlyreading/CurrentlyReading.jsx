// components/currently-reading/CurrentlyReading.jsx
import React, { useState, useCallback } from "react";
import { View, Text, Image, TextInput, Button, TouchableOpacity } from "react-native";
import { useReadingStore } from "../../../hook/useReadingStore";
import { useFocusEffect } from "expo-router";

import styles from "./currentlyreading.style"

const CurrentlyReading = () => {
  const {
    currentlyReading,
    loading,
    reload,
    updateProgress,
    finishCurrentBook,
  } = useReadingStore();

  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [localCurrent, setLocalCurrent] = useState("");
  const [localTotal, setLocalTotal] = useState("");

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading reading data...</Text>
      </View>
    );
  }

  if (!currentlyReading) {
    return null;
  }

  const current = currentlyReading.currentPage || 0;
  const total = currentlyReading.totalPages || 0;

  const percent = total > 0 ? Math.floor((current / total) * 100) : 0;

  const handleEnterEdit = () => {
    setLocalCurrent(String(current));
    setLocalTotal(String(total));
    setIsEditingProgress(true);
  };

  const handleSave = () => {
    const newCurrent = parseInt(localCurrent, 10) || 0;
    const newTotal = parseInt(localTotal, 10) || 0;

    updateProgress({
      currentPage: newCurrent,
      totalPages: newTotal,
    });

    setIsEditingProgress(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        Currently Reading
      </Text>

      {currentlyReading.coverUrl && (
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: currentlyReading.coverUrl }}
            style={styles.logoImage}
          />
        </View>
      )}

      <Text style={styles.bookTitle}>
        {currentlyReading.title}
      </Text>
      <Text style={styles.authorName}>
        {currentlyReading.authors?.join(", ") || "Unknown author"}
      </Text>

  
      <View style={styles.progressSection}>
        {!isEditingProgress ? (
          <TouchableOpacity onPress={handleEnterEdit} style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.progressText}>Update Reading Progress: </Text>
            <Text style={styles.progressText}>
              {percent}% 
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              value={localCurrent}
              onChangeText={setLocalCurrent}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                width: 50,
                padding: 4,
                marginRight: 4,
                textAlign: "center",
                color:"white"
              }}
              onBlur={handleSave}
            />

            <Text style={{ fontSize: 18, marginRight: 4,color:"white" }}>/</Text>

            <TextInput
              value={localTotal}
              onChangeText={setLocalTotal}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                width: 50,
                padding: 4,
                marginRight: 8,
                textAlign: "center",
                color:"white"
              }}
              onBlur={handleSave}
            />
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.finishedButton}
        onPress={() => finishCurrentBook()}
      >
        <Text style={styles.finishedButtonText}>Mark as Finished</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CurrentlyReading;
