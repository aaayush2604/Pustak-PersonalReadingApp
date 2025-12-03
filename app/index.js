import { Text, ScrollView, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, icons, images, SIZES } from "../constants";
import { useRouter, Stack } from "expo-router";
import React, { useState } from "react";
import { ScreenHeaderBtn, Welcome, PopularBooks } from "../components";
import CurrentlyReading from "../components/home/currentlyreading/CurrentlyReading";

const Home = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const goToShelf = () => {
    setMenuOpen(false);
    router.push("/reading-shelf"); // <-- route from app/reading-shelf/index.js
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.lightWhite,
      }}
    >
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: COLORS.lightWhite },
          headerShadowVisible: false,
          headerLeft: () => (
            <ScreenHeaderBtn
              iconUrl={icons.menu}
              dimension="60%"
              handlePress={() => setMenuOpen((prev) => !prev)}
            />
          ),
          headerRight: () => (
            <ScreenHeaderBtn iconUrl={images.dark_logo} dimension="100%" />
          ),
          headerTitle: "",
        }}
      />

      {/* 🔽 Hamburger overlay menu */}
      {menuOpen && (
        <View
          style={{
            position: "absolute",
            top: 60,
            left: 16,
            right: 16,
            zIndex: 10,
          }}
        >
          {/* Tap outside to close */}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: -80,
              left: -16,
              right: -16,
              bottom: -1000,
            }}
            onPress={() => setMenuOpen(false)}
          />

          {/* Menu card */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 12,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <TouchableOpacity
              onPress={goToShelf}
              style={{ paddingVertical: 8 }}
            >
              <Text style={{ fontSize: 16 }}>My Shelf</Text>
            </TouchableOpacity>

            {/* Add more menu items later if you want */}
            {/* <TouchableOpacity
              onPress={() => { ... }}
              style={{ paddingVertical: 8 }}
            >
              <Text style={{ fontSize: 16 }}>Settings</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, width: "100%" }}
      >
        <View style={{ flex: 1, padding: SIZES.medium }}>
          <Welcome style={{ width: "100%" }} />
          <CurrentlyReading />
          <PopularBooks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
