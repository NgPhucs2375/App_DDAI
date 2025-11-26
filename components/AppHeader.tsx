import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native'; // Import DrawerActions
import { useNavigation } from 'expo-router';
import React from 'react';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AppHeader() {
  const navigation = useNavigation();

  const openDrawer = () => {
    // Gửi hành động mở Drawer an toàn
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Nút Menu bên trái để mở Drawer */}
      <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
        <Ionicons name="menu" size={28} color="#FFF" />
      </TouchableOpacity>

      <Text style={styles.title}>NutriScan AI 🥗</Text>
      
      {/* View rỗng bên phải để cân bằng title ở giữa */}
      <View style={{ width: 28 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Sử dụng màu headerBackground (#003049) từ file theme
    backgroundColor: Colors.light.headerBackground || '#003049', 
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: 'row', // Xếp ngang
    alignItems: 'center',
    justifyContent: 'space-between', // Căn đều 2 bên
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  menuButton: {
    padding: 5,
  },
  title: {
    color: '#FFFFFF', // Chữ trắng
    fontSize: 20,
    fontWeight: 'bold',
  },
});