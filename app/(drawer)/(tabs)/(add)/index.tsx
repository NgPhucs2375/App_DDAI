// File: app/(drawer)/(tabs)/(add)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AddFoodGatewayScreen() {
  const router = useRouter();

  const onScanPress = () => {
    router.push('/camera'); 
  };

  const onManualPress = () => {
    router.push('/(drawer)/(tabs)/MealLog'); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thêm bữa ăn</Text>
      <Text style={styles.subtitle}>Bạn muốn thêm món ăn bằng cách nào?</Text>

      <TouchableOpacity style={styles.button} onPress={onScanPress}>
        <Ionicons name="camera-outline" size={32} color="#fff" />
        <Text style={styles.buttonText}>Quét Camera AI</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onManualPress}>
        <Ionicons name="create-outline" size={32} color="#fff" />
        <Text style={styles.buttonText}>Nhập thủ công</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeText}>Đóng</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', padding: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 32 },
  button: {
    backgroundColor: '#C1121F', borderRadius: 15, padding: 20, width: '90%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 },
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 12 },
  closeButton: { marginTop: 20, padding: 10 },
  closeText: { fontSize: 16, color: '#007AFF', fontWeight: '500' },
});