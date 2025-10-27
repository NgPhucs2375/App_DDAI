import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, View, Alert, Platform } from 'react-native';
import { useColorScheme } from '../hooks/use-color-scheme';

export default function Layout_Main() {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = React.useState(true);
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});

    const checkLogin = async () => {
      try {
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');
        setIsLoggedIn(loggedIn === 'true');
      } catch (error) {
        console.error('CheckLogin error:', error);
        Alert.alert('Error', String(error));
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  React.useEffect(() => {
    // global JS error handler để hiện lỗi lên thiết bị + console
    // @ts-ignore
    const defaultHandler = (global as any).ErrorUtils?.getGlobalHandler?.() ?? (global as any).ErrorUtils?.getGlobalHandler;
    // @ts-ignore
    (global as any).ErrorUtils?.setGlobalHandler?.((error: any, isFatal: boolean) => {
      try {
        console.log('Global JS error:', error, 'isFatal:', isFatal);
        // show alert on device so you see it directly
        Alert.alert('Unexpected error', `${isFatal ? 'Fatal: ' : ''}${error?.message || String(error)}`);
      } catch (e) {
        // ignore alert errors
      } finally {
        if (typeof defaultHandler === 'function') {
          defaultHandler(error, isFatal);
        }
      }
    });
  }, []);

  if (loading || isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1abc9c" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
          </>
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

