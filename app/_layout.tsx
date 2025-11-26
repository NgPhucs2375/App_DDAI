import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Href, Stack, useRouter, useSegments } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const segments = useSegments();

  React.useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    const checkLogin = async () => {
      try {
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');
        if (loggedIn === 'true') {
          // The segments.length type does not include 0, so check only the first segment for 'login'.
          if (segments[0] === 'login') {
             router.replace('/' as Href); 
          }
        }
      } catch (error) {
        console.error('CheckLogin error:', error);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []); 

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#C1121F" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* AUTH */}
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />

          {/* APP MAIN (Chứa cả Reports, Settings, History bên trong) */}
          <Stack.Screen name="(drawer)" /> 

          {/* ADMIN */}
          <Stack.Screen name="admin/dashboard" />

          {/* FEATURES (Các màn hình Fullscreen) */}
          <Stack.Screen name="camera" />
          <Stack.Screen name="results" />
          <Stack.Screen name="chatbot" />
          
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}