import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/theme';
import { loadProfile } from '@/src/data/profileStore';
import { Ionicons } from '@expo/vector-icons';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [goal, setGoal] = useState(2000); // Mặc định 2000 kcal
  
  // Mockup dữ liệu đã ăn hôm nay
  const [eaten, setEaten] = useState({
    calories: 1250,
    protein: 90,
    carbs: 150,
    fat: 40,
  });

  // Tải mục tiêu calo từ Profile
  useFocusEffect(
    useCallback(() => {
      loadProfile().then(p => {
        if (p?.goals?.dailyCalories) setGoal(p.goals.dailyCalories);
      });
    }, [])
  );

  const remaining = goal - eaten.calories;
  const progress = Math.min(eaten.calories / goal, 1);

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* 1. HEADER CHÀO MỪNG & NÚT BÁO CÁO */}
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.dateText}>Hôm nay, {new Date().toLocaleDateString('vi-VN')}</Text>
            <Text style={styles.greeting}>Tiến độ trong ngày 📊</Text>
          </View>
          
          {/* Nút đến trang Báo cáo (Đã sửa lỗi cú pháp) */}
          <TouchableOpacity 
            style={styles.reportBtn} 
            onPress={() => router.push('/reports' as Href)} 
          >
            <Ionicons name="stats-chart-outline" size={20} color={Colors.light.tint} />
            <Text style={styles.reportText}>Thống kê</Text>
          </TouchableOpacity>
        </View>

        {/* 2. VÒNG TRÒN TIẾN ĐỘ CALO */}
        <View style={styles.summaryCard}>
          <View style={styles.calorieRow}>
            <View>
              <Text style={styles.calLabel}>Đã ăn</Text>
              <Text style={styles.calValue}>{eaten.calories}</Text>
            </View>
            
            <View style={styles.ring}>
                <Text style={styles.ringText}>{remaining}</Text>
                <Text style={styles.ringSub}>Còn lại</Text>
            </View>

            <View>
              <Text style={styles.calLabel}>Mục tiêu</Text>
              <Text style={styles.calValue}>{goal}</Text>
            </View>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        {/* 3. CHI TIẾT MACROS */}
        <View style={styles.macroRow}>
            <MacroCard label="Protein" value={`${eaten.protein}g`} color="#E9C46A" />
            <MacroCard label="Carbs" value={`${eaten.carbs}g`} color="#2A9D8F" />
            <MacroCard label="Fat" value={`${eaten.fat}g`} color="#F4A261" />
        </View>

        {/* 4. GỢI Ý THỰC ĐƠN */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gợi ý cho bạn 💡</Text>
            <TouchableOpacity onPress={() => router.push('/(drawer)/(tabs)/Recipes' as Href)}>
                <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.suggestionCard}>
            <Ionicons name="restaurant-outline" size={24} color={Colors.light.tint} />
            <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle}>Salad Ức Gà Sốt Chanh</Text>
                <Text style={styles.suggestionSub}>350 kcal • Giàu Protein • 15 phút</Text>
            </View>
            <Ionicons name="chevron-forward" color="#ccc" size={20} />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const MacroCard = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <View style={[styles.macroCard, { borderLeftColor: color }]}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 20 },
  
  headerSection: { 
    marginBottom: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end' 
  },
  dateText: { color: '#888', fontSize: 14, textTransform: 'uppercase' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: Colors.light.text },
  
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  reportText: {
    color: Colors.light.tint,
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },

  summaryCard: {
    backgroundColor: Colors.light.card, borderRadius: 20, padding: 20, marginBottom: 20,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10
  },
  calorieRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  calLabel: { fontSize: 14, color: '#888' },
  calValue: { fontSize: 18, fontWeight: 'bold', color: Colors.light.text },
  ring: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 8, borderColor: Colors.light.tint,
    justifyContent: 'center', alignItems: 'center'
  },
  ringText: { fontSize: 20, fontWeight: 'bold', color: Colors.light.tint },
  ringSub: { fontSize: 12, color: '#888' },
  progressBarBg: { height: 10, backgroundColor: '#eee', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.light.tint },

  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  macroCard: {
    width: '30%', backgroundColor: '#fff', padding: 10, borderRadius: 10,
    borderLeftWidth: 4, elevation: 2
  },
  macroLabel: { fontSize: 12, color: '#666' },
  macroValue: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.light.text },
  seeAll: { color: Colors.light.tint },
  
  suggestionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15,
    borderRadius: 12, elevation: 1
  },
  suggestionContent: { flex: 1, marginLeft: 15 },
  suggestionTitle: { fontWeight: 'bold', fontSize: 15 },
  suggestionSub: { color: '#666', fontSize: 12, marginTop: 4 },
});