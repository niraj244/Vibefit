import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// SecureStore is native-only — use AsyncStorage on web
let SecureStore = null;
if (Platform.OS !== 'web') {
  SecureStore = require('expo-secure-store');
}

export const saveToken = async (key, value) => {
  try {
    if (SecureStore) await SecureStore.setItemAsync(key, value);
    else await AsyncStorage.setItem(key, value);
  } catch {
    await AsyncStorage.setItem(key, value);
  }
};

export const getToken = async (key) => {
  try {
    if (SecureStore) return await SecureStore.getItemAsync(key);
    return await AsyncStorage.getItem(key);
  } catch {
    return await AsyncStorage.getItem(key);
  }
};

export const removeToken = async (key) => {
  try {
    if (SecureStore) await SecureStore.deleteItemAsync(key);
    else await AsyncStorage.removeItem(key);
  } catch {
    await AsyncStorage.removeItem(key);
  }
};

export const saveData = async (key, value) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const getData = async (key) => {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
};

export const removeData = async (key) => {
  await AsyncStorage.removeItem(key);
};
