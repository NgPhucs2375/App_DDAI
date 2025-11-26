import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';

// Nếu bạn sử dụng Expo Router, bạn cần thêm dòng này:
// import { useRouter } from 'expo-router'; 

// Màu sắc
const PRIMARY_BLUE = '#007AFF'; // Xanh dương cơ bản
const BACKGROUND_GREY = '#D8D8D8'; // Xám nền

export default function BasicLayout() {
    const router = useRouter(); 

  const handleCameraPress = () => {
    router.push('/(drawer)/(tabs)/ChoAITraKetqua'); // Logic chuyển trang thực tế
    console.log('--- Đã nhấn: Chuyển đến màn hình Chờ Kết quả (/image-detail) ---');
  };
  const handleCameraPress1 = () => {
    router.push('/(drawer)/(tabs)/ThemMonAnThuCong'); // Logic chuyển trang thực tế
    console.log('--- Đã nhấn: Chuyển đến màn hình Chờ Kết quả (/image-detail) ---');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* UPPER SECTION */}
        <View style={styles.upperSection}>

          {/* Header / Navbar */}
          <View style={styles.header}>
            <View style={styles.headerSquare} />
            <View style={styles.headerInput} />
          </View>

          {/* Main Content Box (Hộp nội dung chính màu xanh) */}
          <View style={styles.mainContentBox}>
            <View style={styles.ovalShape} />
            <Text style={{color: 'white', fontSize: 18, position: 'absolute'}}>CAMERA SCREEN</Text>
          </View>
        </View>

        {/* BOTTOM BAR / FOOTER (Đã sửa lại theo hình ảnh đầu tiên) */}
        <View style={styles.bottomBar}>
          {/* Nút vuông nhỏ */}
          <TouchableOpacity 
            onPress={handleCameraPress1} 
            style={styles.bottomSquare} 
          />
          
          {/* Nút tròn lớn (Camera chính) - Liên kết */}
          <TouchableOpacity 
            onPress={handleCameraPress} 
            style={styles.bottomCircle} 
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // === Layout Cơ bản ===
  safeArea: { flex: 1, backgroundColor: BACKGROUND_GREY },
  container: { flex: 1, padding: 10 },
  upperSection: { flex: 1, marginBottom: 10 },

  // === Header ===
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  headerSquare: { width: 30, height: 30, backgroundColor: PRIMARY_BLUE, borderRadius: 5, marginRight: 10 },
  headerInput: { flex: 1, height: 30, backgroundColor: PRIMARY_BLUE, borderRadius: 15 },

  // === Main Content Box (Hộp xanh lớn) ===
  mainContentBox: {
    flex: 1,
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  // Hình Oval
  ovalShape: {
    width: '80%',
    height: '90%',
    backgroundColor: 'white',
    borderRadius: 999,
  },

  // ----------------------------------------------------
  // 4. BOTTOM BAR STYLES (Đã sửa lại theo hình ảnh đầu tiên)
  // ----------------------------------------------------
  bottomBar: {
    height: 80, 
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around', // Giữ space-around để phân bố 2 nút
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  // Nút vuông nhỏ ở thanh dưới cùng
  bottomSquare: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 5,
    // opacity: 0.5, // Có thể thêm nếu muốn nó ít nổi bật hơn
  },
  
  // Nút tròn lớn (Camera chính)
  bottomCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20, // 1 nửa chiều rộng/cao để tạo hình tròn
    // shadowColor: 'white', // Có thể thêm nếu muốn hiệu ứng nổi bật
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 0.5,
    // shadowRadius: 5,
  },
});