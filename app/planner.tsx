import { Colors } from '@/constants/theme';
import { API_URL } from '@/src/services/api'; // Đảm bảo import đúng
import { useUserStore } from '@/src/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MealPlannerScreen() {
  const router = useRouter();
  const userId = useUserStore(s => s.profile.id);
  const [plan, setPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

 const handleGenerate = async () => {
    setLoading(true);
    try {
        console.log("Đang gọi API tạo thực đơn..."); // Debug 1
        const res = await fetch(`${API_URL}/plan/weekly/${userId}`);
        
        console.log("Status:", res.status); // Debug 2
        
        const data = await res.json();
        console.log("Data nhận được:", data); // Debug 3

        if (Array.isArray(data)) {
            setPlan(data);
        } else {
            Alert.alert("Lỗi", "Dữ liệu trả về không đúng định dạng.");
        }
    } catch (error) {
        console.error("Lỗi Planner:", error); // Debug 4
        Alert.alert("Lỗi kết nối", "Không thể kết nối đến Server AI.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#333"/></TouchableOpacity>
        <Text style={styles.title}>Thực Đơn Tuần 📅</Text>
        <View style={{width: 24}}/>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {plan.length === 0 ? (
            <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={80} color="#DDD" />
                <Text style={styles.emptyText}>Bạn chưa có thực đơn nào.</Text>
                <TouchableOpacity style={styles.genBtn} onPress={handleGenerate} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>Tạo thực đơn ngay ✨</Text>}
                </TouchableOpacity>
            </View>
        ) : (
            plan.map((day, index) => (
                <View key={index} style={styles.dayCard}>
                    <Text style={styles.dayTitle}>{day.day}</Text>
                    <View style={styles.mealRow}><Text style={styles.mealLabel}>🍳 Sáng:</Text><Text style={styles.mealName}>{day.breakfast}</Text></View>
                    <View style={styles.mealRow}><Text style={styles.mealLabel}>🍱 Trưa:</Text><Text style={styles.mealName}>{day.lunch}</Text></View>
                    <View style={styles.mealRow}><Text style={styles.mealLabel}>🍲 Tối:</Text><Text style={styles.mealName}>{day.dinner}</Text></View>
                </View>
            ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FD', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#888', marginTop: 10, marginBottom: 20 },
  genBtn: { backgroundColor: Colors.light.tint, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 25 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  dayCard: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2 },
  dayTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.light.tint, marginBottom: 10 },
  mealRow: { flexDirection: 'row', marginBottom: 5 },
  mealLabel: { fontWeight: '600', width: 60, color: '#555' },
  mealName: { flex: 1, color: '#333' }
});