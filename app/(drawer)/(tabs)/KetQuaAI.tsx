import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'; 
import { useRouter } from 'expo-router';

// Màu sắc
const LIGHT_BLUE = '#7DD3FC'; 
const DARK_BLUE = '#38BDF8'; 
const BACKGROUND_GREY = '#D8D8D8';
const WHITE = '#FFFFFF';
const TEXT_COLOR = '#4A4A4A'; 

// Dữ liệu giả định
const nutritionData = [
  { label: 'Calo', value: '350 kcal', percentage: '10%' },
  { label: 'Protein', value: '25g', percentage: '45%' },
  { label: 'Chất béo', value: '10g', percentage: '15%' },
  { label: 'Carbs', value: '40g', percentage: '30%' },
  { label: 'Vitamin C', value: '30mg', percentage: '50%' },
];

interface NutritionBarProps {
  label: string;
  value: string;
  percentage: string;
}

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
  const router = useRouter();
  const handleCameraPress = () => {
    router.push('/(drawer)/(tabs)/Camera'); 
    console.log('--- Đã nhấn: Quay lại màn hình Camera/Chính (/basic) ---');
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

          {/* MAIN CONTENT BOX */}
          <View style={styles.mainContentBox}>
            <View style={styles.imagePlaceholder} />
            <View style={styles.analysisBar}>
              <Text style={styles.resultTitle}>Kết quả Phân tích</Text>
            </View>
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  // 1. Ô Ảnh
  imagePlaceholder: {
    width: '100%',
    height: '40%', 
    backgroundColor: WHITE,
    borderRadius: 10,
    marginBottom: 15,
  },
  
  // 2. Thanh Kết quả AI
  analysisBar: {
    width: '100%',
    height: 50,
    backgroundColor: WHITE,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },
  
  // 3. Container cho danh sách kết quả (Có khả năng cuộn)
  resultsScrollContainer: { flex: 1, width: '100%' },

  // === Thanh Dinh Dưỡng ===
  nutritionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 55, 
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
    backgroundColor: DARK_BLUE, 
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  barPercentage: { color: WHITE, fontWeight: 'bold' },

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