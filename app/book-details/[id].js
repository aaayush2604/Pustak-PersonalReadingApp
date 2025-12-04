import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";

import {
  BookBrief,
  BookDescription,
  BookTabs,
  ScreenHeaderBtn,
  Specifics,
} from "../../components";
import { COLORS, SIZES, icons, FONT } from "../../constants";
import useFetchDescription from "../../hook/useFetchDescription";

import { useReadingStore } from "../../hook/useReadingStore";
import { useToast, POSTION } from "expo-toast";


const tabs = ["Description", "Excerpts", "Characters"];

const BookDetails = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const { setCurrentlyReading, addToTBR } = useReadingStore();
  const [authorNames, setAuthorNames] = useState("Unknown Author");

  const { data, isLoading, error, refetch } = useFetchDescription({
    workKey: params.id,
    editionKey: params.editionKey,
  });

  const toast = useToast();


  // build a normalized book object for store (TBR + currentlyReading)
  const buildBookForStore = () => {
    if (!data) return null;

    const workKeyFull = data.key || "";
    const workKey =
      workKeyFull.split("/").filter(Boolean).pop() || params.id;

    let coverUrl = null;
    if (Array.isArray(data.covers) && data.covers.length > 0) {
      const lastCoverId = data.covers[data.covers.length - 1];
      coverUrl = `https://covers.openlibrary.org/b/id/${lastCoverId}-L.jpg`;
    }

    // turn "Author1, Author2" into ["Author1", "Author2"]
    const authorsArray =
      authorNames && authorNames !== "Unknown Author"
        ? authorNames.split(",").map((s) => s.trim())
        : [];

    return {
      workKey,
      editionKey: params.editionKey,
      title: data.title,
      authors: authorsArray,
      coverUrl,
      totalPages: data.edition?.number_of_pages,
      currentPage: 0,
    };
  };

  const handleStartReading = () => {
    const book = buildBookForStore();
    if (!book) return;
    setCurrentlyReading(book);
    toast.show("Updated to Currently Reading", {
      position: POSTION.BOTTOM,
      duration: 1500,
      containerStyle: { marginBottom: 40 },
    });
  };

  const handleAddToTBR = () => {
    const book = buildBookForStore();
    if (!book) return;
    addToTBR(book);
    toast.show("Added to TBR", {
      position: POSTION.BOTTOM,           // 👈 bottom
      duration: 1500,                     // ms
      containerStyle: { marginBottom: 40 } // 👈 push it further up
    });
  };

  const displayTabContent = () => {
    if (!data) return null;

    switch (activeTab) {
      case "Excerpts": {
        const points =
          Array.isArray(data.excerpts) && data.excerpts.length > 0
            ? data.excerpts.map((item) => {
                const ex = item.excerpt;
                if (typeof ex === "string") return ex;
                if (ex && typeof ex === "object" && "value" in ex) {
                  return ex.value;
                }
                return "N/A";
              })
            : ["N/A"];

        return <Specifics title="Excerpts" points={points} />;
      }

      case "Description": {
        let descriptionText = "No data provided";

        if (typeof data.description === "string") {
          descriptionText = data.description;
        } else if (
          data.description &&
          typeof data.description === "object" &&
          "value" in data.description
        ) {
          descriptionText = data.description.value;
        }

        return <BookDescription info={descriptionText} />;
      }

      case "Characters":
        return (
          <Specifics
            title="Characters"
            points={
              Array.isArray(data.subject_people) && data.subject_people.length > 0
                ? data.subject_people
                : ["N/A"]
            }
          />
        );
      default:
        return null;
    }
  };


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch && refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: COLORS.lightWhite },
          headerShadowVisible: false,
          headerBackVisible: false,
          headerLeft: () => (
            <ScreenHeaderBtn
              iconUrl={icons.left}
              dimension="60%"
              handlePress={() => router.back()}
            />
          ),
          headerRight: () => (
            <ScreenHeaderBtn
              iconUrl={icons.share}
              dimension="60%"
              handlePress={() => {}}
            />
          ),
          headerTitle: "",
        }}
      />

      <ScrollView
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : error ? (
          <Text>Something went wrong</Text>
        ) : !data ? (
          <Text>No data available</Text>
        ) : (
          <View style={{ padding: SIZES.medium, paddingBottom: 100 }}>
            <BookBrief book={data} onAuthorsLoaded={setAuthorNames}/>

            <BookTabs
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {displayTabContent()}

            <View
              style={{
                flexDirection: "row",
                marginTop: SIZES.large,
                gap: SIZES.medium,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: COLORS.tertiary,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: SIZES.small,
                  borderRadius: SIZES.medium,
                }}
                onPress={handleStartReading}
              >
                <Text
                  style={{
                    fontSize: SIZES.medium,
                    color: COLORS.cream,
                    fontFamily: FONT.bold,
                  }}
                >
                  Start Reading
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: COLORS.primary,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: SIZES.small,
                  borderRadius: SIZES.medium,
                }}
                onPress={handleAddToTBR}
              >
                <Text
                  style={{
                    fontSize: SIZES.medium,
                    color: COLORS.cream,
                    fontFamily: FONT.bold,
                  }}
                >
                  Add to TBR
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookDetails;
