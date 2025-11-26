import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // Dòng này import hook

// Màu sắc
const LIGHT_BLUE = '#7DD3FC'; 
const DARK_BLUE = '#38BDF8'; 
const BACKGROUND_GREY = '#D8D8D8'; 
const TEXT_COLOR = '#000';

export default function ImageDetailLayout() {
  // KHAI BÁO BIẾN ROUTER BỊ THIẾU Ở ĐÂY
  const router = useRouter(); // <--- ĐÃ THÊM: Dòng này khởi tạo biến 'router'

  const handleCameraPress = () => {
    router.push('/(drawer)/(tabs)/KetQuaAI'); // Bây giờ 'router' đã được định nghĩa và hoạt động
    console.log('--- Đã nhấn: Chuyển đến màn hình Kết quả AI (/nutrition-result) ---');
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* UPPER SECTION */}
        <View style={styles.upperSection}>
          <View style={styles.header}>
            <View style={styles.headerSquare} />
            <View style={styles.headerInput} />
          </View>
          <View style={styles.mainContentBox}>
            <View style={styles.imagePlaceholder} />
            <View style={styles.analysisBar}>
              <Text style={styles.analysisText}>Đang phân tích dữ liệu</Text>
            </View>
          </View>
        </View>

        {/* BOTTOM BAR / FOOTER (Chỉ có 2 nút) */}
        <View style={styles.bottomBar}>
          {/* Nút vuông nhỏ */}
          <View style={styles.bottomSquare} />
          
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
  headerSquare: { width: 30, height: 30, backgroundColor: LIGHT_BLUE, borderRadius: 5, marginRight: 10 },
  headerInput: { flex: 1, height: 30, backgroundColor: LIGHT_BLUE, borderRadius: 15 },

  // === Main Content Box ===
  mainContentBox: {
    flex: 1,
    backgroundColor: LIGHT_BLUE,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  imagePlaceholder: {
    width: '90%',
    height: '60%',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
  },
  analysisBar: {
    width: '90%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisText: { color: TEXT_COLOR, fontSize: 16, fontWeight: 'bold' },

  // ----------------------------------------------------
  // 4. BOTTOM BAR STYLES (Chỉ 2 nút, màu DARK_BLUE)
  // ----------------------------------------------------
  bottomBar: {
    height: 80, 
    backgroundColor: DARK_BLUE, 
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  // Nút vuông nhỏ
  bottomSquare: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  
  // Nút tròn lớn (Camera chính) - style chung
  bottomCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
  },
});