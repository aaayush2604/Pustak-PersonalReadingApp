import React from "react";
import { View } from "react-native";
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryArea,
  VictoryGroup
} from "victory-native";

export default function GlobalReadingChart({ segments }) {
  if (!segments || segments.length === 0) {
    console.log(segments==null)
    return <View style={{ height: 260 }} />;
  }

  return (
    <VictoryChart
      height={320}
      padding={{ top: 20, bottom: 50, left: 25, right: 25 }}
      scale={{ x: "time" }}
    >
      <VictoryAxis
        tickFormat={(t) =>
          `${new Date(t).getDate()}/${new Date(t).getMonth() + 1}`
        }
        style={{
          grid: { stroke: "rgba(0,0,0,0.08)" },
          tickLabels: { fontSize: 10, angle: -30, textAnchor: "end" },
        }}
      />

      <VictoryAxis
        dependentAxis
        style={{
          grid: { stroke: "rgba(0,0,0,0.08)" },
          tickLabels: { fontSize: 10 },
        }}
      />

      {segments.map((seg, idx) => (
        <VictoryGroup key={`${seg.workKey}-${idx}`} >
          <VictoryArea
            data={seg.points}
            x="x"
            y="y"
            y0={0}
            // interpolation="monotoneX"
            style={{
              data: {
                fill: seg.color,
                fillOpacity: 0.18,
                stroke: "transparent",
              },
            }}
          />

          <VictoryLine
            data={seg.points}
            x="x"
            y="y"
            // interpolation="monotoneX"
            style={{
              data: {
                stroke: seg.color,
                strokeWidth: 1,
              },
            }}
          />
        </VictoryGroup>
      ))}


    </VictoryChart>
  );
}
