import React from "react";
import { View, Text } from "react-native";
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
} from "victory-native";
import { COLORS } from "../../constants";

export default function BookReadingChart({ title, data,color }) {
  if (!data || data.length === 0) {
    return <Text>No reading sessions for this book.</Text>;
  }

  return (
    <View style={{ marginTop: 24 }}>
      <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
        Pages read per day — {title}
      </Text>

      <VictoryChart
        height={260}
        padding={{ top: 20, bottom: 40, left: 25, right: 25 }}
        scale={{ x: "time" }}
      >
        <VictoryAxis
          tickFormat={(t) =>
            `${new Date(t).getDate()}/${new Date(t).getMonth() + 1}`
          }
          style={{
            grid: { stroke: "rgba(0,0,0,0.08)" },
            tickLabels: { fontSize: 10 },
          }}
        />

        <VictoryAxis
          dependentAxis
          style={{
            grid: { stroke: "rgba(0,0,0,0.08)" },
            tickLabels: { fontSize: 10 },
          }}
        />

        <VictoryLine
            data={data}
            x="x"
            y="y"
            style={{
                data: {
                stroke: color || "#111",
                strokeWidth: 2,
                },
            }}
        />
      </VictoryChart>
    </View>
  );
}
