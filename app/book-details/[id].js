import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { use, useCallback, useState } from "react";

import {
  BookBrief,
  BookDescription,
  JobFooter,
  BookTabs,
  ScreenHeaderBtn,
  Specifics,
} from "../../components";
import { COLORS, SIZES, icons, FONT } from "../../constants";
import useFetchDescription from "../../hook/useFetchDescription";

import { useReadingStore } from "../../hook/useReadingStore";

const tabs = ["Description", "Excerpts", "Characters"];

const BookDetails = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const { setCurrentlyReading } = useReadingStore();

  const displayTabContent = () => {
    console.log(data);
    switch (activeTab) {
      case "Excerpts":
        return (
          <Specifics
            title="Excerpts"
            points={data.excerpts?.map((item) => item.excerpt) ?? ["N/A"]}
          />
        );
      case "Description":
        return (
          <BookDescription info={data.description?? "No data provided"} />
        );
      case "Characters":
        return (
          <Specifics
            title="Characters"
            points={data.subject_people}
          />
        );
      default:
        break;
    }
  };

  const handleStartReading = () => {
    const book = {
      workKey: data.key || params.id,            // "/works/OL138052W" or "OL138052W"
      editionKey: params.editionKey,
      title: data.title,
      authors: data.authors,         // whatever you already computed
      coverUrl: `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`,           
      totalPages: data.edition?.number_of_pages, // if you fetched edition
      currentPage: 0,
    };

    setCurrentlyReading(book);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  }, []);

  const { data, isLoading, error } = useFetchDescription({
    workKey: params.id,
    editionKey: params.editionKey,
  });

  let coverUrl = null;

  if (Array.isArray(data?.covers) && data.covers.length > 0) {
    const lastCoverId = data.covers[data.covers.length - 1]; // 👈 last cover
    coverUrl = `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`;
  }


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
              handlePress={() => router.back}
            />
          ),
          headerTitle: "",
        }}
      />

      <>
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
          ) : data.length === 0 ? (
            <Text>No data available</Text>
          ) : (
            <View style={{ padding: SIZES.medium, paddingBottom: 100 }}>
              <BookBrief
                book={data}
              />
              <BookTabs
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              {displayTabContent()}
              {/* <Button title="Start Reading" onPress={handleStartReading} /> */}
              <TouchableOpacity style={{flex: 1, backgroundColor: COLORS.tertiary, height: "100%", justifyContent: "center",alignItems: "center",marginLeft: SIZES.medium,borderRadius: SIZES.medium}} onPress={handleStartReading}>
                <Text style={{ fontSize: SIZES.medium,color: COLORS.cream,fontFamily: FONT.bold,}}>Start Reading</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        <JobFooter
          url={
            data[0]?.job_google_link ?? "https://careers.google.com/job/results"
          }
        />
      </>
    </SafeAreaView>
  );
};

export default BookDetails;
