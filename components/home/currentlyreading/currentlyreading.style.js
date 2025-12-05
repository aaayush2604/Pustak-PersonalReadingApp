import { StyleSheet } from "react-native";

import { COLORS, FONT, SHADOWS, SIZES } from "../../../constants";

const styles = StyleSheet.create({
  container:{
    width: "100%",
    padding: SIZES.xLarge,
    backgroundColor: COLORS.tertiary,
    borderRadius: SIZES.medium,
    justifyContent: "space-between",
    ...SHADOWS.medium,
    shadowColor: COLORS.white,
    marginTop:25
  },
  logoContainer: {
    width: 100,
    height: 150,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.xSmall,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 0,
    marginVertical: 10,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: SIZES.xSmall,
  },
  headerText: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.cream,
    marginTop: SIZES.small / 1.5,
  },
  authorName:{
    color:"#555",
    fontFamily:FONT.regular,
    marginVertical:3
  },
  infoContainer: {
    marginTop: SIZES.large,
  },
  bookTitle:{
    color:"white",
    marginVertical:3
  },
  progressSection:{
    color:"white",
    fontFamily:FONT.regular,
    marginVertical:10
  },
  progressText:{
    color:"white",
    fontFamily:FONT.regular,
  },
  finishedButton: {
    marginVertical: 10,
    backgroundColor: COLORS.cream,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    },
    finishedButtonText: {
        color: COLORS.tertiary,
        fontFamily: FONT.bold,
        fontSize: 16,
    },
    saveButton: {
      backgroundColor: "#4CAF50",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      marginLeft: 8,
    },
    saveButtonText: {
      color: "white",
      fontWeight: "bold",
    },
});

export default styles;
