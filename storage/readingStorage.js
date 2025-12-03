// storage/readingStorage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@reading_state_v1";

export const defaultReadingState = {
  tbrBooks: [],
  currentlyReading: null,
  finishedBooks: [],
  readingSessions: [],
};

export const loadReadingState = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return defaultReadingState;

    const parsed = JSON.parse(json);

    // ✅ merge defaults with saved data
    return {
      ...defaultReadingState,
      ...parsed,
    };
  } catch (e) {
    console.error("Failed to load reading state", e);
    return defaultReadingState;
  }
};

export const saveReadingState = async (state) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save reading state", e);
  }
};
