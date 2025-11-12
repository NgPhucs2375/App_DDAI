import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AppHeader from '../../components/AppHeader';

export default function ProfileRedirectScreen() {
  useEffect(() => {
    // Điều hướng sang tab profile (đường dẫn công khai không có group)
    router.replace('/profile' as any);
  }, []);

  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.content}>
        <ActivityIndicator />
        <Text style={styles.text}>Đang mở hồ sơ...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  text: { fontSize: 14, color: '#003049' },
});
