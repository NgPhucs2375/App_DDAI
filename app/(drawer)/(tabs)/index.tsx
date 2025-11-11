import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useNavigation, useRouter } from 'expo-router';
import React from 'react';
// THAY ĐỔI: Thêm Text cho nút bấm tùy chỉnh
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import TourListScreen from '../../../src/components/TourListSrceen';

// ============ STYLE (ĐÃ CẬP NHẬT MÀU SẮC) ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // THAY ĐỔI: 60% Nền - Dùng màu trung tính sáng
    backgroundColor: '#F5F5F5', 
  },
  header: {
    // THAY ĐỔI: 30% - Màu thứ cấp làm Header
    backgroundColor: '#003049', // (Cosmos Blue)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // THAY ĐỔI: Thêm viền màu xanh nhạt (Accent phụ)
    borderColor: '#669BBC', // (Blue Marble)
    borderWidth: 2,
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    fontSize: 16,
    // THAY ĐỔI: Màu chữ tìm kiếm hợp với theme
    color: '#003049', 
  },
  content: {
    flex: 1,
    // THAY ĐỔI: Nền trong suốt để hiển thị màu container
    backgroundColor: 'transparent', 
    alignItems: 'center',
    padding: 15, // Thêm padding cho nội dung
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    // THAY ĐỔI: 30% - Màu tiêu đề
    color: '#003049', // (Cosmos Blue)
  },
  // THAY ĐỔI: Thêm style cho nút bấm CTA
  customButton: {
    // THAY ĐỔI: 10% - Màu điểm nhấn
    backgroundColor: '#C1121F', // (Crimson Blaze)
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  customButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
// ===============================================

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        {/* Avatar */}
        <TouchableOpacity onPress={openDrawer}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100' }}
            style={styles.avatar}
          />
        </TouchableOpacity>

        {/* Ô tìm kiếm */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Tìm kiếm..."
            placeholderTextColor="#555"
            style={styles.searchInput}
          />
        </View>

        {/* Nút bên phải */}
        <TouchableOpacity>
          {/* THAY ĐỔI: Dùng màu xanh nhạt (Accent phụ) cho icon */}
          <Ionicons name="notifications-outline" size={26} color="#669BBC" />
        </TouchableOpacity>
      </View>

      {/* BODY */}
      <View style={styles.content}>
        <Text style={styles.title}>Trang chủ</Text>
        
        {/* THAY ĐỔI: Thay <Button> bằng <TouchableOpacity> để tùy chỉnh màu 10% */}
        <TouchableOpacity 
          style={styles.customButton} 
          onPress={() => router.push('/details')}
        >
          <Text style={styles.customButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>

        {/* Phần <Tab.Navigator> đã được comment ra là đúng rồi */}
        <View style={{ flex: 1, width: '100%' }}>
          <TourListScreen />
        </View>

      </View>
    </View>
  );
}