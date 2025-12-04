import React from "react";
import { View, Text } from "react-native";

import styles from "./specifics.style";

const Specifics = ({ title, points }) => {
  // Ensure title is always a string
  const safeTitle =
    typeof title === "string" || typeof title === "number"
      ? String(title)
      : "Info";

  // Ensure points is always an array of strings
  const safePoints = Array.isArray(points) ? points : [];
  const normalizedPoints =
    safePoints.length > 0
      ? safePoints.map((p) =>
          typeof p === "string" || typeof p === "number"
            ? String(p)
            : "N/A"
        )
      : ["N/A"];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{safeTitle}:</Text>

      <View style={styles.pointsContainer}>
        {normalizedPoints.map((item, index) => (
          <View style={styles.pointWrapper} key={`${item}-${index}`}>
            {/* Use a View for the bullet dot instead of an empty Text */}
            <View style={styles.pointDot} />
            <Text style={styles.pointText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Specifics;
