import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import React from 'react';

export default function Layout_Main() {
  const colorScheme = useColorScheme();
  return(
    <ThemeProvider value={colorScheme === 'dark'? DarkTheme: DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{headerShown:false}}/>
        <Stack.Screen name="details" options={{title: 'Chi tiết'}}/>
      </Stack>
      <StatusBar style="auto"/>
    </ThemeProvider>
  );
}