// app/index.js
import {
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, icons, images, SIZES } from "../constants";
import { useRouter, Stack } from "expo-router";
import React, { useState } from "react";
import { ScreenHeaderBtn, Welcome, PopularBooks } from "../components";
import CurrentlyReading from "../components/home/currentlyreading/CurrentlyReading";
import useBookSearch from "../hook/useBookSearch";

const Home = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const goToShelf = () => {
    setMenuOpen(false);
    router.push("/reading-shelf");
  };

  const goToStatistics = () => {
    setMenuOpen(false);
    router.push("/statistics");
  };

  // 🔍 Search state
  const [searchTerm, setSearchTerm] = useState("");
  const { results, loadingSearch, searchError, searchBooks, clearResults } =
    useBookSearch();

  const [welcomeHeight, setWelcomeHeight] = useState(0);

  const handleSearchClick = () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      clearResults();
      return;
    }
    searchBooks(trimmed);
  };

  const handleBookPress = (item) => {
    if (!item.workKey) return;

    const path = `/book-details/${item.workKey}${
      item.editionKey ? `?editionKey=${item.editionKey}` : ""
    }`;

    router.push(path);
  };

  const showSearchOverlay =
    loadingSearch || results.length > 0 || searchError;

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

      {/* Hamburger Menu */}
      {menuOpen && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 16,
            right: 16,
            zIndex: 20,
          }}
        >
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
          <View
            style={{
              backgroundColor: COLORS.tertiary,
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
            <TouchableOpacity onPress={goToShelf} style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 16, color: COLORS.cream }}>My Shelf</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goToStatistics}
              style={{ paddingVertical: 8 }}
            >
              <Text style={{ fontSize: 16, color: COLORS.cream }}>
                Statistics
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* MAIN SCROLL VIEW */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, width: "100%" }}
      >
        <View style={{ flex: 1, padding: SIZES.medium }}>
          {/* Capture welcome height */}
          <View
            onLayout={(e) =>
              setWelcomeHeight(e.nativeEvent.layout.height)
            }
          >
            <Welcome
              searchTerm={searchTerm}
              setSearchTerm={(text) => {
                setSearchTerm(text);
                if (text.trim() === "") clearResults();
              }}
              handleClick={handleSearchClick}
            />
          </View>

          {/* 🔎 SEARCH OVERLAY */}
          {showSearchOverlay && (
            <View
              style={{
                position: "absolute",
                top: welcomeHeight + SIZES.medium,
                left: SIZES.medium,
                right: SIZES.medium,
                zIndex: 10,
                backgroundColor: COLORS.lightWhite,
                borderRadius: 8,
                padding: SIZES.small,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 4,
                elevation: 4,
                maxHeight: 320,
              }}
            >
              {/* Loading state */}
              {loadingSearch && (
                <View
                  style={{
                    marginVertical: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text
                    style={{ fontSize: 12, color: "#666", marginTop: 6 }}
                  >
                    Searching...
                  </Text>
                </View>
              )}

              {/* Error */}
              {searchError && !loadingSearch && (
                <Text style={{ color: "red", marginBottom: 8 }}>
                  {searchError}
                </Text>
              )}

              {/* Results */}
              {!loadingSearch && results.length > 0 && (
                <ScrollView>
                  {results.map((item) => {
                    const coverUrl = item.coverId
                      ? `https://covers.openlibrary.org/b/id/${item.coverId}-M.jpg`
                      : "https://t4.ftcdn.net/jpg/05/05/61/73/360_F_505617309_NN1CW7diNmGXJfMicpY9eXHKV4sqzO5H.jpg";

                    let authorText = "Unknown author";
                    if (Array.isArray(item.author)) authorText = item.author.join(", ");
                    else if (typeof item.author === "string") authorText = item.author;
                    else if (Array.isArray(item.authors)) authorText = item.authors.join(", ");
                    else if (typeof item.authors === "string") authorText = item.authors;

                    return (
                      <TouchableOpacity
                        key={item.workKey + (item.editionKey || "")}
                        onPress={() => handleBookPress(item)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 8,
                          paddingVertical: 6,
                        }}
                      >
                        <Image
                          source={{ uri: coverUrl }}
                          style={{
                            width: 40,
                            height: 60,
                            borderRadius: 4,
                            marginRight: 10,
                          }}
                        />

                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: "600" }} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={{ color: "#555", fontSize: 12 }} numberOfLines={1}>
                            {authorText}
                          </Text>
                          <Text style={{ color: "#999", fontSize: 11 }}>
                            First published: {item.firstPublishYear}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}

          {/* HOME CONTENT */}
          <CurrentlyReading />
          <PopularBooks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
