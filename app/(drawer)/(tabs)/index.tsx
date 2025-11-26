import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/theme';
import { loadMeals } from '@/src/data/mealStore';
import { useUserStore } from '@/src/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics'; // 1. Import Rung
import { Href, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit'; // 2. Import Biểu đồ

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HomeScreen() {
  const router = useRouter();
  const goal = useUserStore(state => state.profile?.goals?.dailyCalories ?? 2000);
  const [eaten, setEaten] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  const calculateEatenStats = useCallback(async () => {
    const meals = await loadMeals();
    const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    
    // Giả lập tính Macros (Vì hiện tại DB chỉ lưu calo, sau này API thật sẽ trả về số này)
    // Tỷ lệ giả định: Pro 20%, Carb 50%, Fat 30%
    setEaten({
        calories: totalCalories,
        protein: Math.round(totalCalories * 0.05), 
        carbs: Math.round(totalCalories * 0.12),  
        fat: Math.round(totalCalories * 0.03),    
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      calculateEatenStats();
    }, [calculateEatenStats])
  );

  const remaining = goal - eaten.calories;
  const progress = Math.min(eaten.calories / goal, 1);
  const isOverLimit = remaining < 0;

  // --- DATA CHO BIỂU ĐỒ TRÒN (SCIENTIFIC) ---
  const pieData = [
    { name: 'Đạm', population: eaten.protein, color: '#E9C46A', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Tinh bột', population: eaten.carbs, color: '#2A9D8F', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Béo', population: eaten.fat, color: '#F4A261', legendFontColor: '#7F7F7F', legendFontSize: 12 },
  ];

  // Logic Gợi ý
  const getSuggestion = () => {
    if (isOverLimit) return { title: 'Trà Thảo Mộc', sub: '0 kcal • Thanh lọc', icon: 'leaf' };
    if (remaining < 300) return { title: 'Salad Ức Gà', sub: '250 kcal • Nhẹ bụng', icon: 'restaurant' };
    return { title: 'Cơm Gà Nướng', sub: '650 kcal • Đủ chất', icon: 'restaurant' };
  };
  const suggestion = getSuggestion();

  // Hàm xử lý rung khi bấm nút
  const handlePressReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Rung nhẹ
    router.push('/reports' as Href);
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.dateText}>Hôm nay, {new Date().toLocaleDateString('vi-VN')}</Text>
            <Text style={styles.greeting}>Tiến độ 📊</Text>
          </View>
          <TouchableOpacity style={styles.reportBtn} onPress={handlePressReport}>
            <Ionicons name="stats-chart-outline" size={20} color={Colors.light.tint} />
            <Text style={styles.reportText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>

        {/* Cảnh báo */}
        {isOverLimit && (
          <View style={styles.warningBox}>
            <Ionicons name="alert-circle" size={24} color="#D32F2F" />
            <Text style={styles.warningText}>Vượt quá {Math.abs(remaining)} kcal!</Text>
          </View>
        )}

        {/* CARD TỔNG QUAN (Calo + Pie Chart) */}
        <View style={styles.summaryCard}>
          <View style={styles.rowBetween}>
             {/* Bên trái: Calo */}
             <View>
                <Text style={styles.label}>Mục tiêu: {goal}</Text>
                <Text style={[styles.bigNumber, isOverLimit && {color: '#D32F2F'}]}>
                    {eaten.calories} <Text style={styles.unit}>kcal</Text>
                </Text>
                <Text style={styles.subLabel}>{isOverLimit ? 'Vượt mức' : 'Đã nạp'}</Text>
                
                {/* Thanh Progress nhỏ */}
                <View style={styles.miniProgressBg}>
                    <View style={[styles.miniProgressFill, { width: `${progress * 100}%`, backgroundColor: isOverLimit ? '#D32F2F' : Colors.light.tint }]} />
                </View>
             </View>

             {/* Bên phải: Biểu đồ tròn Macros */}
             <View style={{marginLeft: -20}}>
                <PieChart
                    data={pieData}
                    width={160}
                    height={100}
                    chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    hasLegend={false} // Ẩn chú thích mặc định để tự làm đẹp hơn
                    center={[35, 0]}
                    absolute
                />
                {/* Chú thích nhỏ dưới biểu đồ */}
                <Text style={styles.chartNote}>Tỷ lệ dinh dưỡng</Text>
             </View>
          </View>

          {/* Chú thích Macros đẹp hơn */}
          <View style={styles.macroLegend}>
             <LegendItem color="#E9C46A" label="Đạm" value={`${eaten.protein}g`} />
             <LegendItem color="#2A9D8F" label="Carb" value={`${eaten.carbs}g`} />
             <LegendItem color="#F4A261" label="Béo" value={`${eaten.fat}g`} />
          </View>
        </View>

        {/* Gợi ý thông minh */}
        <Text style={styles.sectionTitle}>Gợi ý tiếp theo 💡</Text>
        <TouchableOpacity style={styles.suggestionCard} onPress={() => {
            Haptics.selectionAsync(); // Rung phản hồi
            router.push('/(drawer)/(tabs)/Recipes' as Href);
        }}>
            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name={suggestion.icon as any} size={24} color={Colors.light.tint} />
            </View>
            <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                <Text style={styles.suggestionSub}>{suggestion.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" color="#ccc" size={20} />
        </TouchableOpacity>

      </ScrollView>

      {/* Nút Chatbot FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/chatbot' as Href);
      }}>
        <Ionicons name="chatbubbles" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const LegendItem = ({ color, label, value }: { color: string, label: string, value: string }) => (
    <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 15}}>
        <View style={{width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: 5}} />
        <Text style={{fontSize: 12, color: '#555'}}>{label} <Text style={{fontWeight: 'bold'}}>{value}</Text></Text>
    </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' }, // Màu nền sáng hiện đại hơn
  content: { padding: 20, paddingBottom: 90 },
  
  headerSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  dateText: { color: '#888', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  greeting: { fontSize: 26, fontWeight: '800', color: '#1A1A1A' },
  
  reportBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#eee' },
  reportText: { color: Colors.light.tint, fontWeight: '600', marginLeft: 4, fontSize: 13 },

  warningBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', padding: 12, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#FFCDD2' },
  warningText: { color: '#D32F2F', fontWeight: 'bold', marginLeft: 10 },

  summaryCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 25, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 14, color: '#888' },
  bigNumber: { fontSize: 32, fontWeight: '800', color: '#1A1A1A', marginVertical: 5 },
  unit: { fontSize: 16, fontWeight: '500', color: '#888' },
  subLabel: { fontSize: 14, color: '#555', fontWeight: '500' },
  
  miniProgressBg: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, width: 100, marginTop: 10 },
  miniProgressFill: { height: '100%', borderRadius: 3 },
  
  chartNote: { textAlign: 'center', fontSize: 10, color: '#aaa', marginTop: -10, marginLeft: 20 },
  macroLegend: { flexDirection: 'row', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f5f5f5' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  
  suggestionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.03 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  suggestionContent: { flex: 1 },
  suggestionTitle: { fontWeight: '700', fontSize: 16, color: '#333', marginBottom: 2 },
  suggestionSub: { color: '#666', fontSize: 13 },

  fab: { position: 'absolute', bottom: 25, right: 20, width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.light.tint, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: Colors.light.tint, shadowOpacity: 0.4, shadowOffset: {width: 0, height: 4} },
});