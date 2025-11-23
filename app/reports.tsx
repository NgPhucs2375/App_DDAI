import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ReportsScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // UC17: Dữ liệu Tuần (Bar Chart)
  const weekData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [{ data: [1800, 2100, 1950, 2300, 2000, 1500, 1700] }],
  };

  // UC18: Dữ liệu Tháng (Line Chart) - Demo 4 tuần
  const monthData = {
    labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
    datasets: [{ data: [13500, 14200, 12800, 15000] }],
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(193, 18, 31, ${opacity})`, // Màu đỏ chủ đạo
    strokeWidth: 2,
    barPercentage: 0.6,
    decimalPlaces: 0, 
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      
      {/* Nút Back */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
            <Text style={styles.navTitle}>Báo cáo thống kê 📈</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Switch Tuần / Tháng */}
        <View style={styles.segmentContainer}>
            <TouchableOpacity 
                style={[styles.segmentBtn, viewMode === 'week' && styles.segmentActive]} 
                onPress={() => setViewMode('week')}
            >
                <Text style={[styles.segmentText, viewMode === 'week' && styles.segmentTextActive]}>Tuần này</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.segmentBtn, viewMode === 'month' && styles.segmentActive]} 
                onPress={() => setViewMode('month')}
            >
                <Text style={[styles.segmentText, viewMode === 'month' && styles.segmentTextActive]}>Tháng này</Text>
            </TouchableOpacity>
        </View>

        {/* Biểu đồ */}
        <Text style={styles.chartTitle}>
            {viewMode === 'week' ? 'Calo tiêu thụ (7 ngày qua)' : 'Tổng Calo theo tuần'}
        </Text>
        
        <View style={styles.chartCard}>
            {viewMode === 'week' ? (
                <BarChart
                    data={weekData}
                    width={SCREEN_WIDTH - 60}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={chartConfig}
                    verticalLabelRotation={0}
                    fromZero
                    showValuesOnTopOfBars
                />
            ) : (
                <LineChart
                    data={monthData}
                    width={SCREEN_WIDTH - 60}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix="k"
                    chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(0, 48, 73, ${opacity})`, // Màu xanh
                    }}
                    bezier
                    fromZero
                />
            )}
        </View>

        {/* Phân tích chữ */}
        <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Đánh giá</Text>
            <Text style={styles.summaryText}>
                {viewMode === 'week' 
                 ? 'Bạn đã nạp trung bình 1,907 kcal/ngày trong tuần qua. Thứ 5 là ngày bạn ăn nhiều nhất (2,300 kcal).'
                 : 'Tháng này bạn kiểm soát calo khá tốt. Tổng lượng calo nạp vào tăng nhẹ ở tuần 4.'}
            </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  navRow: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, color: Colors.light.text },
  content: { padding: 20 },
  
  segmentContainer: { flexDirection: 'row', backgroundColor: '#eee', borderRadius: 10, padding: 4, marginBottom: 20 },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentActive: { backgroundColor: '#fff', elevation: 2 },
  segmentText: { color: '#666', fontWeight: '500' },
  segmentTextActive: { color: Colors.light.tint, fontWeight: 'bold' },

  chartTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#333' },
  chartCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 10, alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, marginBottom: 20,
  },
  
  summaryBox: { backgroundColor: '#E3F2FD', padding: 15, borderRadius: 12 },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#003049', marginBottom: 5 },
  summaryText: { color: '#003049', lineHeight: 22 },
});