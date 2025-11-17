import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native'; // Thêm ScrollView

// Màu sắc
const LIGHT_BLUE = '#7DD3FC'; // Xanh dương nhạt (Main Box)
const DARK_BLUE = '#38BDF8'; // Xanh dương đậm (Bottom Bar)
const BACKGROUND_GREY = '#D8D8D8'; // Xám nền
const WHITE = '#FFFFFF';
const TEXT_COLOR = '#4A4A4A'; // Màu chữ xám đậm

// Dữ liệu giả định
const nutritionData = [
  { label: 'Calo', value: '350 kcal', percentage: '10%' },
  { label: 'Protein', value: '25g', percentage: '45%' },
  { label: 'Chất béo', value: '10g', percentage: '15%' },
  { label: 'Carbs', value: '40g', percentage: '30%' },
  { label: 'Vitamin C', value: '30mg', percentage: '50%' }, // Thêm 1 mục để test cuộn
];

interface NutritionBarProps {
  label: string;
  value: string;
  percentage: string;
}

// Component nhỏ để tạo một thanh kết quả dinh dưỡng
const NutritionBar = ({ label, value, percentage }: NutritionBarProps) => (
  <View style={styles.nutritionBar}>
    <View style={styles.barContent}>
      <Text style={styles.barLabel}>{label}</Text>
      <Text style={styles.barValue}>{value}</Text>
    </View>
    <View style={styles.barArrowPlaceholder}>
      <Text style={styles.barPercentage}>{percentage}</Text>
    </View>
  </View>
);

export default function NutritionResultLayout() {
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

          {/* ------------------------------------------------------------------ */}
          {/* MAIN CONTENT BOX (Hộp xanh lớn) */}
          {/* Đã thay đổi: Bố cục dọc cho Ô Ảnh, Thanh Kết Quả và Danh sách Dinh Dưỡng */}
          {/* ------------------------------------------------------------------ */}
          <View style={styles.mainContentBox}>
            
            {/* 1. Ô ẢNH (Ảnh sau khi chụp từ Camera) */}
            <View style={styles.imagePlaceholder} />

            {/* 2. THANH KẾT QUẢ AI (Đẩy xuống dưới ô ảnh) */}
            <View style={styles.analysisBar}>
              <Text style={styles.resultTitle}>Kết quả Phân tích</Text>
            </View>

            {/* 3. DANH SÁCH DINH DƯỠNG (Sử dụng ScrollView nếu danh sách dài) */}
            <ScrollView style={styles.resultsScrollContainer}>
              {nutritionData.map((data, index) => (
                <NutritionBar 
                  key={index}
                  label={data.label}
                  value={data.value}
                  percentage={data.percentage}
                />
              ))}
            </ScrollView>

          </View>
        </View>

        {/* BOTTOM BAR / FOOTER */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomSquare} />
          <View style={styles.bottomCircle} />
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

  // === Main Content Box (Hộp xanh lớn) ===
  mainContentBox: {
    flex: 1,
    backgroundColor: LIGHT_BLUE,
    borderRadius: 20,
    padding: 20, // Padding xung quanh nội dung
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // KHÔNG dùng 'space-between' nữa, để nội dung chảy theo thứ tự
  },
  
  // 1. Ô Ảnh
  imagePlaceholder: {
    width: '100%',
    height: '40%', // Chiếm 40% chiều cao cho ảnh
    backgroundColor: WHITE,
    borderRadius: 10,
    marginBottom: 15, // Khoảng cách với thanh bên dưới
    // Bỏ justifyContent/alignItems nếu chỉ để hiển thị ảnh
  },
  
  // 2. Thanh Kết quả AI (Mục đích: thay thế ô vuông nhỏ có mũi tên)
  analysisBar: {
    width: '100%',
    height: 50,
    backgroundColor: WHITE,
    borderRadius: 10,
    justifyContent: 'center', // Căn giữa chữ theo chiều dọc
    paddingHorizontal: 15,
    marginBottom: 15, // Khoảng cách với danh sách dinh dưỡng
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },
  
  // 3. Container cho danh sách kết quả (Có khả năng cuộn)
  resultsScrollContainer: {
    flex: 1, // Cho phép cuộn và chiếm không gian còn lại
    width: '100%',
  },

  // === Thanh Dinh Dưỡng (NutritionBar Component) ===
  nutritionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 55, // Giảm chiều cao thanh dinh dưỡng
    backgroundColor: WHITE,
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  barContent: { flexDirection: 'row', justifyContent: 'space-between', flex: 1 },
  barLabel: { fontSize: 16, color: TEXT_COLOR, fontWeight: 'bold' },
  barValue: { fontSize: 16, color: TEXT_COLOR },
  barArrowPlaceholder: {
    width: 60,
    height: 35,
    backgroundColor: LIGHT_BLUE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  barPercentage: { color: WHITE, fontWeight: 'bold' },

  // === Bottom Bar ===
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
  },
  bottomSquare: { width: 30, height: 30, backgroundColor: WHITE, borderRadius: 5 },
  bottomCircle: { width: 40, height: 40, backgroundColor: WHITE, borderRadius: 20 },
});