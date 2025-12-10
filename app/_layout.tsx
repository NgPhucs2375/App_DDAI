import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  React.useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        
        {/* 👇 ĐÃ SỬA: Đưa StatusBar ra ngoài Stack để không bị lỗi WARN */}
        <StatusBar style="dark" />
        
        <Stack screenOptions={{ headerShown: false }}>
          {/* Màn hình điều hướng (Lễ tân) */}
          <Stack.Screen name="index" />
          
          {/* Màn hình Intro */}
          <Stack.Screen name="onboarding" />

          {/* Nhóm Auth */}
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />

          {/* Nhóm App chính */}
          <Stack.Screen name="(drawer)" /> 

          {/* Nhóm Admin */}
          <Stack.Screen name="admin/dashboard" />

          {/* Các màn hình chức năng */}
          <Stack.Screen name="camera" />
          <Stack.Screen name="results" />
          <Stack.Screen name="chatbot" />
          <Stack.Screen name="planner" />
        </Stack>

      </ThemeProvider>
    </GestureHandlerRootView>
  );
}