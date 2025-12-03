import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/theme';
import { AIService, MealService } from '@/src/services/api';
import { useUserStore } from '@/src/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ReportsScreen() {
  const { profile } = useUserStore();
  const userId = profile.id;
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setAiAnalysis('');

    const endDate = new Date();
    const startDate = new Date();
    if (viewMode === 'week') startDate.setDate(endDate.getDate() - 6);
    else startDate.setDate(endDate.getDate() - 29);

    try {
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      const rawData = await MealService.getHistoricalReport(Number(userId), startStr, endStr);
      
      if (rawData && rawData.length > 0) {
        processChartData(rawData, viewMode);
        
        // Gọi AI phân tích (Gửi dữ liệu tóm tắt để tránh lỗi)
        const summary = rawData.map((d: any) => `${d.date}: ${d.totals.calories.toFixed(0)}kcal`).join('\n');
        const aiRes = await AIService.analyzeReport(Number(userId), {
            user_name: profile.fullName || 'User',
            target_cal: rawData[0].target,
            data_summary: rawData // Backend sẽ xử lý chuỗi này
        });
        setAiAnalysis(aiRes?.analysis || "AI đang bận, thử lại sau.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId, viewMode]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // Xử lý dữ liệu biểu đồ thông minh
  const processChartData = (data: any[], mode: string) => {
    let labels: string[] = [];
    let values: number[] = [];
    let avgMacros = { p: 0, c: 0, f: 0 };

    if (mode === 'week') {
        // Chế độ Tuần: Hiển thị từng ngày (T2, T3...)
        labels = data.map((d: any) => {
            const date = new Date(d.date);
            return `${date.getDate()}/${date.getMonth()+1}`;
        });
        values = data.map((d: any) => d.totals.calories);
    } else {
        // Chế độ Tháng: Gom thành 4 tuần
        labels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
        values = [0, 0, 0, 0];
        data.forEach((d: any, index) => {
            const weekIndex = Math.min(Math.floor(index / 7), 3);
            values[weekIndex] += d.totals.calories;
        });
        // Lấy trung bình tuần
        values = values.map(v => Math.round(v / 7));
    }

    // Tính Macro trung bình
    if (data.length > 0) {
        avgMacros.p = data.reduce((acc: number, d: any) => acc + d.totals.protein, 0);
        avgMacros.c = data.reduce((acc: number, d: any) => acc + d.totals.carbs, 0);
        avgMacros.f = data.reduce((acc: number, d: any) => acc + d.totals.fat, 0);
    }

    setChartData({
        bar: { labels, datasets: [{ data: values }] },
        pie: [
            { name: 'Đạm', population: avgMacros.p, color: '#E9C46A', legendFontColor: '#7F7F7F', legendFontSize: 12 },
            { name: 'Carb', population: avgMacros.c, color: '#2A9D8F', legendFontColor: '#7F7F7F', legendFontSize: 12 },
            { name: 'Béo', population: avgMacros.f, color: '#F4A261', legendFontColor: '#7F7F7F', legendFontSize: 12 },
        ]
    });
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Switcher */}
        <View style={styles.segmentContainer}>
            {['week', 'month'].map((m) => (
                <TouchableOpacity key={m} style={[styles.segment, viewMode === m && styles.activeSegment]} onPress={() => setViewMode(m as any)}>
                    <Text style={[styles.segText, viewMode === m && {color: '#fff'}]}>{m === 'week' ? '7 Ngày qua' : 'Tháng này'}</Text>
                </TouchableOpacity>
            ))}
        </View>

        {loading ? <ActivityIndicator size="large" color={Colors.light.tint} /> : (
            chartData && (
                <>
                    <Text style={styles.chartTitle}>Biểu đồ Calo ({viewMode === 'month' ? 'Trung bình tuần' : 'Hàng ngày'})</Text>
                    <BarChart
                        data={chartData.bar}
                        width={SCREEN_WIDTH - 40}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={chartConfig}
                        fromZero
                        showValuesOnTopOfBars
                        style={{borderRadius: 16}}
                    />

                    <Text style={[styles.chartTitle, {marginTop: 20}]}>Tỷ lệ dinh dưỡng tổng thể</Text>
                    <PieChart
                        data={chartData.pie}
                        width={SCREEN_WIDTH - 40}
                        height={200}
                        chartConfig={chartConfig}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                    />

                    {/* AI ANALYSIS */}
                    <View style={styles.aiBox}>
                        <View style={{flexDirection:'row', alignItems:'center', marginBottom: 10}}>
                            <Ionicons name="sparkles" size={20} color="#FFD700" />
                            <Text style={{fontWeight:'bold', marginLeft: 8, fontSize: 16}}>Góc nhìn AI</Text>
                        </View>
                        <Text style={{lineHeight: 22, color: '#444'}}>{aiAnalysis || 'Đang phân tích...'}</Text>
                    </View>
                </>
            )
        )}
      </ScrollView>
    </View>
  );
}

const chartConfig = {
    backgroundGradientFrom: '#fff', backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(193, 18, 31, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    barPercentage: 0.7,
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    segmentContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 4, marginBottom: 20 },
    segment: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8 },
    activeSegment: { backgroundColor: Colors.light.tint },
    segText: { fontWeight: '600', color: '#666' },
    chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    aiBox: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginTop: 20, elevation: 2 }
});