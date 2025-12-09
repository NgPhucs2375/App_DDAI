import AppHeader from '@/components/AppHeader';
import { MealService } from '@/src/services/api';
import { useUserStore } from '@/src/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

// --- DỮ LIỆU GỢI Ý MẪU (Giả lập AI) ---
const SUGGESTIONS = {
    breakfast: [
        { name: 'Phở Bò Tái', cal: 350, reason: 'Khởi đầu ngày mới đầy năng lượng!', icon: '🍜' },
        { name: 'Bánh Mì Ốp La', cal: 300, reason: 'Bữa sáng nhanh gọn, đủ chất.', icon: '🥪' },
        { name: 'Yến Mạch & Sữa', cal: 250, reason: 'Giàu chất xơ, tốt cho tiêu hóa.', icon: '🥣' }
    ],
    lunch: [
        { name: 'Cơm Gà Xối Mỡ', cal: 600, reason: 'Bù đắp năng lượng cho buổi chiều.', icon: '🍗' },
        { name: 'Bún Thịt Nướng', cal: 450, reason: 'Nhiều rau, vị ngon dễ ăn.', icon: '🥗' },
        { name: 'Cá Hồi Áp Chảo', cal: 400, reason: 'Giàu Omega-3 và Đạm tốt.', icon: '🐟' }
    ],
    dinner: [
        { name: 'Salad Ức Gà', cal: 300, reason: 'Nhẹ bụng, dễ ngủ, giàu đạm.', icon: '🥗' },
        { name: 'Canh Chua Cá', cal: 200, reason: 'Thanh mát, ít calo.', icon: '🍲' },
        { name: 'Rau Luộc Kho Quẹt', cal: 150, reason: 'Dân dã, healthy tuyệt đối.', icon: '🥦' }
    ],
    snack: [
        { name: 'Sữa Chua Hy Lạp', cal: 100, reason: 'Tốt cho đường ruột.', icon: '🥛' },
        { name: 'Táo Mỹ', cal: 52, reason: 'Vitamin tự nhiên.', icon: '🍎' },
        { name: 'Hạt Hạnh Nhân', cal: 150, reason: 'Chất béo tốt cho tim mạch.', icon: '🥜' }
    ]
};

export default function HomeScreen() {
  const router = useRouter();
  const userId = useUserStore(s => s.profile.id);
  const fullName = useUserStore(s => s.profile.fullName);
  const profileGoal = useUserStore(s => s.profile.goals?.dailyCalories);
  const { streak } = useUserStore();
  
  const [eaten, setEaten] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [waterCount, setWaterCount] = useState(0);
  const [suggestion, setSuggestion] = useState<any>(null);

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

  // --- LOGIC GỢI Ý THÔNG MINH ---
  useEffect(() => {
      const hour = new Date().getHours();
      let timeKey = 'snack';
      if (hour >= 6 && hour < 10) timeKey = 'breakfast';
      else if (hour >= 11 && hour < 14) timeKey = 'lunch';
      else if (hour >= 17 && hour < 20) timeKey = 'dinner';

      // Lấy list món phù hợp khung giờ
      const list = SUGGESTIONS[timeKey as keyof typeof SUGGESTIONS];
      
      // Chọn món phù hợp với Calo còn lại
      // (Nếu còn nhiều calo -> Gợi ý món to, còn ít -> Gợi ý món nhỏ)
      let pick = list[0];
      if (remaining < 300) pick = list.find(x => x.cal < 200) || list[2]; 
      else pick = list[Math.floor(Math.random() * list.length)];

      setSuggestion({ ...pick, timeKey });
  }, [remaining]);

  const pieData = [
    { name: 'Đạm', population: eaten.protein || 1, color: '#4ECDC4', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Carb', population: eaten.carbs || 1, color: '#FF6B6B', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Béo', population: eaten.fat || 1, color: '#FFE66D', legendFontColor: '#7F7F7F', legendFontSize: 12 },
  ];

  const handleAddWater = () => {
    setWaterCount(prev => {
        const newValue = prev < 8 ? prev + 1 : 0;
        if (newValue === 8) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Tuyệt vời! 🎉", "Bạn đã uống đủ 2000ml nước hôm nay! 💧", [{ text: "OK" }]);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        return newValue;
    });
  };

  const handlePress = (route: string) => {
    Haptics.selectionAsync();
    router.push(route as Href);
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
            <View>
                <Text style={styles.date}>{new Date().toLocaleDateString('vi-VN', {weekday: 'long', day:'numeric', month:'long'})}</Text>
                <Text style={styles.greeting}>Hi, {fullName?.split(' ').pop() || 'Bạn'} 👋</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <View style={styles.streakBadge}>
                    <Ionicons name="flame" size={20} color="#FF5722" />
                    <Text style={{fontWeight: '800', color: '#FF5722', marginLeft: 4}}>{streak}</Text>
                </View>
                <TouchableOpacity style={styles.avatarBtn} onPress={() => handlePress('/profile')}>
                    <Ionicons name="person" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>

        {/* HERO CARD */}
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
                <View style={styles.ringContainer}>
                    <View style={[styles.ring, { borderColor: 'rgba(255,255,255,0.3)' }]} />
                    <View style={[styles.ring, { borderColor: '#fff', borderLeftColor: 'transparent', borderBottomColor: 'transparent', transform: [{ rotate: `${progress * 360}deg` }] }]} />
                    <Text style={styles.ringText}>{Math.round(progress * 100)}%</Text>
                </View>
            </View>
            <View style={styles.heroBottom}>
                <MacroPill label="Đạm" value={eaten.protein} color="rgba(255,255,255,0.2)" />
                <MacroPill label="Carb" value={eaten.carbs} color="rgba(255,255,255,0.2)" />
                <MacroPill label="Béo" value={eaten.fat} color="rgba(255,255,255,0.2)" />
            </View>
        </LinearGradient>

        {/* 👇 AI SUGGESTION CARD (MỚI) */}
        {suggestion && (
            <View style={styles.aiCard}>
                <View style={styles.aiHeader}>
                    <Ionicons name="sparkles" size={20} color="#F1C40F" />
                    <Text style={styles.aiTitle}>Gợi ý bữa {suggestion.timeKey === 'breakfast' ? 'Sáng' : suggestion.timeKey === 'lunch' ? 'Trưa' : suggestion.timeKey === 'dinner' ? 'Tối' : 'Phụ'}</Text>
                </View>
                <View style={styles.aiContent}>
                    <View style={styles.aiIconBox}><Text style={{fontSize: 30}}>{suggestion.icon}</Text></View>
                    <View style={{flex: 1}}>
                        <Text style={styles.aiFoodName}>{suggestion.name}</Text>
                        <Text style={styles.aiReason}>{suggestion.reason}</Text>
                        <Text style={styles.aiCalo}>{suggestion.cal} kcal</Text>
                    </View>
                    <TouchableOpacity style={styles.aiAddBtn} onPress={() => handlePress('/(drawer)/(tabs)/MealLog')}>
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        )}

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
        <View style={styles.grid}>
            <QuickAction icon="scan" color="#6C5CE7" title="Quét AI" onPress={() => handlePress('/(add)')} />
            <QuickAction icon="restaurant" color="#00CEC9" title="Thực đơn" onPress={() => handlePress('/(drawer)/(tabs)/Recipes')} />
            <QuickAction icon="stats-chart" color="#FD79A8" title="Báo cáo" onPress={() => handlePress('/reports')} />
            <QuickAction icon="chatbubbles" color="#FDCB6E" title="Trợ lý" onPress={() => handlePress('/chatbot')} />
            <QuickAction icon="barcode-outline" color="#2D3436" title="Quét Mã" onPress={() => router.push('/barcode-scan')} />
        </View>

        {/* WATER & CHART (Giữ nguyên) */}
        <View style={styles.waterCard}>
            <View style={styles.waterInfo}>
                <Text style={styles.waterTitle}>Uống nước</Text>
                <Text style={styles.waterSub}>{waterCount * 250}ml / 2000ml</Text>
            </View>
            <View style={styles.waterCups}>
                {[...Array(8)].map((_, i) => (
                    <TouchableOpacity key={i} onPress={handleAddWater} style={styles.cupBtn}>
                        <Ionicons name={i < waterCount ? "water" : "water-outline"} size={28} color={i < waterCount ? "#3498DB" : "#BDC3C7"} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FD' },
  content: { padding: 24, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  date: { fontSize: 13, color: '#95A5A6', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  greeting: { fontSize: 28, fontWeight: '800', color: '#2D3436' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0E6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  avatarBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2F80ED', justifyContent: 'center', alignItems: 'center', shadowColor: '#2F80ED', shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  
  heroCard: { borderRadius: 24, padding: 24, marginBottom: 20, shadowColor: '#2F80ED', shadowOpacity: 0.25, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
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

  // STYLE CHO AI CARD
  aiCard: { backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 30, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderLeftWidth: 4, borderLeftColor: '#F1C40F' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 5 },
  aiTitle: { fontWeight: '700', color: '#F1C40F', textTransform: 'uppercase', fontSize: 12 },
  aiContent: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  aiIconBox: { width: 50, height: 50, backgroundColor: '#FFF9C4', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  aiFoodName: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  aiReason: { fontSize: 12, color: '#666', marginTop: 2 },
  aiCalo: { fontSize: 12, color: '#E67E22', fontWeight: '700', marginTop: 4 },
  aiAddBtn: { width: 40, height: 40, backgroundColor: '#2D3436', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

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