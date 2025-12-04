import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";

import styles from "./tabs.style";
import { SIZES } from "../../../constants";

const TabButton = ({ name, activeTab, onHandleSearchType }) => {
  const label =
    typeof name === "string" || typeof name === "number"
      ? String(name)
      : "Tab";

  return (
    <TouchableOpacity
      style={styles.btn(name, activeTab)}
      onPress={onHandleSearchType}
    >
      <Text style={styles.btnText(name, activeTab)}>{label}</Text>
    </TouchableOpacity>
  );
};

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  const safeTabs = Array.isArray(tabs) ? tabs : [];

  return (
    <View style={styles.container}>
      <FlatList
        data={safeTabs}
        renderItem={({ item }) => (
          <TabButton
            name={item}
            activeTab={activeTab}
            onHandleSearchType={() => setActiveTab(item)}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) =>
          typeof item === "string" ? item : `tab-${index}`
        }
        contentContainerStyle={{ columnGap: SIZES.small / 2 }}
      />
    </View>
  );
};

export default Tabs;
