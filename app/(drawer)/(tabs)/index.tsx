import AppHeader from '@/components/AppHeader';
import { MealService } from '@/src/services/api';
import { useUserStore } from '@/src/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient'; // Cần cài thêm: npx expo install expo-linear-gradient
import { Href, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const userId = useUserStore(s => s.profile.id);
  const fullName = useUserStore(s => s.profile.fullName);
  const profileGoal = useUserStore(s => s.profile.goals?.dailyCalories);

  const [eaten, setEaten] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [waterCount, setWaterCount] = useState(0);
  
  // Animation Scale cho nút bấm
  const scaleAnim = new Animated.Value(1);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (!userId) return;
        try {
          const data = await MealService.getDailyReport(Number(userId));
          if (data) {
            setEaten({
                calories: data.total_calories || 0,
                protein: data.macros?.protein || 0,
                carbs: data.macros?.carbs || 0,
                fat: data.macros?.fat || 0
            });
          }
        } catch (error) { console.error(error); }
      };
      fetchData();
    }, [userId])
  );

  const goal = profileGoal || 2000;
  const remaining = goal - eaten.calories;
  const progress = Math.min(eaten.calories / goal, 1);
  const isOverLimit = remaining < 0;

  const pieData = [
    { name: 'Đạm', population: eaten.protein || 1, color: '#4ECDC4', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Carb', population: eaten.carbs || 1, color: '#FF6B6B', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Béo', population: eaten.fat || 1, color: '#FFE66D', legendFontColor: '#7F7F7F', legendFontSize: 12 },
  ];

  const handleAddWater = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWaterCount(prev => (prev < 8 ? prev + 1 : 0));
  };

  const handlePress = (route: string) => {
    Haptics.selectionAsync();
    router.push(route as Href);
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* HEADER CHÀO MỪNG */}
        <View style={styles.header}>
            <View>
                <Text style={styles.date}>{new Date().toLocaleDateString('vi-VN', {weekday: 'long', day:'numeric', month:'long'})}</Text>
                <Text style={styles.greeting}>Hi, {fullName?.split(' ').pop() || 'Bạn'} 👋</Text>
            </View>
            <TouchableOpacity style={styles.avatarBtn} onPress={() => handlePress('/profile')}>
                <Ionicons name="person" size={20} color="#fff" />
            </TouchableOpacity>
        </View>

        {/* CARD TỔNG QUAN (HERO CARD) */}
        <LinearGradient
            colors={isOverLimit ? ['#FF416C', '#FF4B2B'] : ['#56CCF2', '#2F80ED']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroCard}
        >
            <View style={styles.heroTop}>
                <View>
                    <Text style={styles.heroLabel}>Đã nạp</Text>
                    <Text style={styles.heroValue}>{eaten.calories.toFixed(0)}</Text>
                    <Text style={styles.heroUnit}>/ {goal} kcal</Text>
                </View>
                {/* Vòng tròn Progress tự chế bằng View */}
                <View style={styles.ringContainer}>
                    <View style={[styles.ring, { borderColor: 'rgba(255,255,255,0.3)' }]} />
                    <View style={[styles.ring, { 
                        borderColor: '#fff', 
                        borderLeftColor: 'transparent', 
                        borderBottomColor: 'transparent',
                        transform: [{ rotate: `${progress * 360}deg` }] 
                    }]} />
                    <Text style={styles.ringText}>{Math.round(progress * 100)}%</Text>
                </View>
            </View>
            
            <View style={styles.heroBottom}>
                <MacroPill label="Đạm" value={eaten.protein} color="rgba(255,255,255,0.2)" />
                <MacroPill label="Carb" value={eaten.carbs} color="rgba(255,255,255,0.2)" />
                <MacroPill label="Béo" value={eaten.fat} color="rgba(255,255,255,0.2)" />
            </View>
        </LinearGradient>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
        <View style={styles.grid}>
            <QuickAction icon="scan" color="#6C5CE7" title="Quét AI" onPress={() => handlePress('/(add)')} />
            <QuickAction icon="restaurant" color="#00CEC9" title="Thực đơn" onPress={() => handlePress('/(drawer)/(tabs)/Recipes')} />
            <QuickAction icon="stats-chart" color="#FD79A8" title="Báo cáo" onPress={() => handlePress('/reports')} />
            <QuickAction icon="chatbubbles" color="#FDCB6E" title="Trợ lý" onPress={() => handlePress('/chatbot')} />
        </View>

        {/* WATER TRACKER (Giao diện mới) */}
        <View style={styles.waterCard}>
            <View style={styles.waterInfo}>
                <Text style={styles.waterTitle}>Uống nước</Text>
                <Text style={styles.waterSub}>{waterCount * 250}ml / 2000ml</Text>
            </View>
            <View style={styles.waterCups}>
                {[...Array(8)].map((_, i) => (
                    <TouchableOpacity key={i} onPress={handleAddWater} style={styles.cupBtn}>
                        <Ionicons 
                            name={i < waterCount ? "water" : "water-outline"} 
                            size={28} 
                            color={i < waterCount ? "#3498DB" : "#BDC3C7"} 
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        {/* MACRO CHART */}
        <Text style={styles.sectionTitle}>Phân bổ dinh dưỡng</Text>
        <View style={styles.chartCard}>
            <PieChart
                data={pieData}
                width={width - 80}
                height={180}
                chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
            />
        </View>

      </ScrollView>
    </View>
  );
}

// Components con
const MacroPill = ({ label, value, color }: any) => (
    <View style={[styles.pill, { backgroundColor: color }]}>
        <Text style={styles.pillLabel}>{label}</Text>
        <Text style={styles.pillValue}>{value.toFixed(0)}g</Text>
    </View>
);

const QuickAction = ({ icon, color, title, onPress }: any) => (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
        <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
);

// Styles Pro Max
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FD' },
  content: { padding: 24, paddingBottom: 100 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  date: { fontSize: 13, color: '#95A5A6', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  greeting: { fontSize: 28, fontWeight: '800', color: '#2D3436' },
  avatarBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2F80ED', justifyContent: 'center', alignItems: 'center', shadowColor: '#2F80ED', shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },

  heroCard: { borderRadius: 24, padding: 24, marginBottom: 30, shadowColor: '#2F80ED', shadowOpacity: 0.25, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600' },
  heroValue: { color: '#fff', fontSize: 42, fontWeight: '900' },
  heroUnit: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  
  ringContainer: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  ring: { position: 'absolute', width: '100%', height: '100%', borderRadius: 40, borderWidth: 6 },
  ringText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  heroBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 6 },
  pillLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
  pillValue: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3436', marginBottom: 16, marginTop: 10 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 30 },
  actionBtn: { width: (width - 48 - 12) / 2, backgroundColor: '#fff', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  iconCircle: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionText: { fontSize: 15, fontWeight: '600', color: '#2D3436' },

  waterCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 30, flexDirection: 'column', gap: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  waterInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  waterTitle: { fontSize: 16, fontWeight: '700', color: '#2D3436' },
  waterSub: { color: '#3498DB', fontWeight: '600' },
  waterCups: { flexDirection: 'row', justifyContent: 'space-between' },
  cupBtn: { padding: 5 },

  chartCard: { backgroundColor: '#fff', borderRadius: 24, padding: 10, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
});