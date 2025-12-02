import { Text, ScrollView, View} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, icons, images, SIZES } from "../constants";
import { useRouter, Stack } from "expo-router";
import { useCallback } from "react";
import {ScreenHeaderBtn, Welcome, PopularBooks} from "../components";
import CurrentlyReading from "../components/home/currentlyreading/CurrentlyReading";


const Home = () => {
  const router = useRouter();
  

  return (
    <SafeAreaView
      style={{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:COLORS.lightWhite
      }}
    >
      <Stack.Screen
        options={{
          headerStyle:{backgroundColor: COLORS.lightWhite},
          headerShadowVisible:false,
          headerLeft:()=>(
            <ScreenHeaderBtn iconUrl={icons.menu} dimension="60%"/>
          ),
          headerRight:()=>(
            <ScreenHeaderBtn iconUrl={images.dark_logo} dimension="100%"/>
          ),
          headerTitle:""
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false}
        style={{ flex: 1, width: "100%" }}>
        <View style={{ flex: 1, padding: SIZES.medium }}>
          <Welcome style={{width:"100%"}}/>
          <CurrentlyReading/>
          <PopularBooks/>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
export default Home;
