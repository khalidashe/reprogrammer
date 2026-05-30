import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Convex Auth needs a key/value store for session tokens.
 *
 * On native we use expo-secure-store (Keychain on iOS, EncryptedSharedPreferences
 * on Android). On web we fall back to AsyncStorage because SecureStore is not
 * available there.
 */
export const authSecureStorage =
  Platform.OS === 'web'
    ? {
        getItem: (key: string) => AsyncStorage.getItem(key),
        setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
        removeItem: (key: string) => AsyncStorage.removeItem(key),
      }
    : {
        getItem: (key: string) => SecureStore.getItemAsync(key),
        setItem: (key: string, value: string) =>
          SecureStore.setItemAsync(key, value),
        removeItem: (key: string) => SecureStore.deleteItemAsync(key),
      };
