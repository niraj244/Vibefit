import '../global.css';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../context/AppContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <StatusBar style="dark" backgroundColor="#fff" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ headerShown: false }} />
          <Stack.Screen name="orders/index" options={{ headerShown: false }} />
          <Stack.Screen name="orders/success" options={{ headerShown: false }} />
          <Stack.Screen name="orders/tracking" options={{ headerShown: false }} />
          <Stack.Screen name="orders/return" options={{ headerShown: false }} />
          <Stack.Screen name="address/index" options={{ headerShown: false }} />
          <Stack.Screen name="address/add" options={{ headerShown: false }} />
          <Stack.Screen name="search" options={{ headerShown: false }} />
          <Stack.Screen name="payment-webview" options={{ headerShown: false }} />
        </Stack>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
