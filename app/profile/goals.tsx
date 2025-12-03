import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/theme';
import { UserService } from '@/src/services/api'; // Import Service
import { useUserStore } from '@/src/store/userStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function GoalsScreen() {
  const router = useRouter();
  const { profile, setProfile } = useUserStore();

  const [targetWeight, setTargetWeight] = useState(profile.goals?.targetWeightKg?.toString() || '');
  const [targetDate, setTargetDate] = useState(profile.goals?.targetDate || '');
  const [dailyCalories, setDailyCalories] = useState(profile.goals?.dailyCalories?.toString() || '');

  const handleSave = async () => {
    const tWeight = Number(targetWeight);
    const tCal = Number(dailyCalories);

    if (tWeight && (tWeight < 20 || tWeight > 400)) {
      Alert.alert('Lỗi', 'Cân nặng mục tiêu không hợp lệ');
      return;
    }

    try {
        // Gửi lên Server
        const res = await UserService.updateProfile(Number(profile.id), {
            target_weight: tWeight,
            target_date: targetDate,
            target_calories: tCal, // Gửi số Calo user tự chọn
            // Giữ nguyên các thông số cũ để không bị null
            height: profile.heightCm,
            weight: profile.weightKg
        });

        // Cập nhật Store Local
        setProfile({
            ...profile,
            goals: {
                targetWeightKg: tWeight,
                targetDate: targetDate,
                dailyCalories: tCal || res.new_target_calories // Nếu user không nhập thì lấy số Server tính
            }
        });

        Alert.alert('Thành công', 'Mục tiêu đã được lưu!');
        router.back();

    } catch (e) {
        Alert.alert("Lỗi", "Không kết nối được Server");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Thiết lập Mục tiêu 🎯</Text>
        
        <Field label="Cân nặng mục tiêu (kg)">
          <TextInput style={styles.input} value={targetWeight} onChangeText={setTargetWeight} keyboardType="numeric" placeholder="VD: 60"/>
        </Field>
        
        <Field label="Thời hạn (YYYY-MM-DD)">
          <TextInput style={styles.input} value={targetDate} onChangeText={setTargetDate} placeholder="VD: 2025-12-31" />
        </Field>
        
        <Field label="Calo/ngày (Để trống nếu muốn tự động tính)">
          <TextInput style={styles.input} value={dailyCalories} onChangeText={setDailyCalories} keyboardType="numeric" placeholder="VD: 2000"/>
        </Field>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Lưu mục tiêu</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20, color: Colors.light.text },
  field: { marginBottom: 15 },
  fieldLabel: { marginBottom: 8, fontWeight: '500', color: '#555' },
  input: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#eee', padding: 12, fontSize: 16 },
  saveBtn: { marginTop: 20, backgroundColor: Colors.light.tint, paddingVertical: 15, borderRadius: 30, alignItems: 'center', elevation: 2 },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});