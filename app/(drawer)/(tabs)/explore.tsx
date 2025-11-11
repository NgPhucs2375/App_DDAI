import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import AppHeader from '../../../components/AppHeader';
import { Colors } from '../../../constants/theme';

// ============ STYLE ============


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
  },
   text: { fontSize: 22, fontWeight: 'bold', color: Colors.light.text },
});


export default function ExploreScreen() {
    const router = useRouter();
  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={{ padding: 16 }}>
        <Button
          title="Đi tới màn hình nhận diện món ăn"
          onPress={() => router.push('/food_recognition')}
        />
      </View>
      <Text style={styles.text}>Khám phá thế giới 🌏</Text>
    </View>
  );
}

