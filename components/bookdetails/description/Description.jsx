import React from "react";
import { View, Text } from "react-native";

import styles from "./description.style";

const Description = ({ info }) => {
  let safeInfo = "No data provided";

  if (typeof info === "string" || typeof info === "number") {
    safeInfo = String(info);
  } else if (info && typeof info === "object" && "value" in info) {
    // In case someone passes the raw OpenLibrary description object here
    safeInfo = String(info.value ?? "No data provided");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headText}>Book Description:</Text>
      <View style={styles.container}>
        <Text style={styles.contextText}>{safeInfo}</Text>
      </View>
    </View>
  );
};

export default Description;
