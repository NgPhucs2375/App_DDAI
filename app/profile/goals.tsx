import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../constants/theme';
import { loadProfile, saveProfile } from '../../src/data/profileStore';
import { UserProfile } from '../../src/types/profile';

export default function GoalsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [targetWeight, setTargetWeight] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [dailyCalories, setDailyCalories] = useState('');

  useEffect(() => {
    loadProfile().then(p => {
      setProfile(p);
      if (p?.goals) {
        setTargetWeight(p.goals.targetWeightKg?.toString() || '');
        setTargetDate(p.goals.targetDate || '');
        setDailyCalories(p.goals.dailyCalories?.toString() || '');
      }
    });
  }, []);

  const persist = async () => {
    const targetWeightNum = targetWeight ? Number(targetWeight) : undefined;
    const dailyCalNum = dailyCalories ? Number(dailyCalories) : undefined;

    if (targetWeightNum && (targetWeightNum < 20 || targetWeightNum > 400)) {
      Alert.alert('Cân nặng mục tiêu không hợp lệ (20-400 kg)');
      return;
    }
    if (dailyCalNum && (dailyCalNum < 800 || dailyCalNum > 6000)) {
      Alert.alert('Calo/ngày không hợp lệ (800-6000)');
      return;
    }

    const newProfile: UserProfile = {
      id: profile?.id || 'local-user',
      allergies: profile?.allergies || [],
      fullName: profile?.fullName,
      age: profile?.age,
      heightCm: profile?.heightCm,
      weightKg: profile?.weightKg,
      gender: profile?.gender,
      goals: {
        targetWeightKg: targetWeightNum,
        targetDate: targetDate || undefined,
        dailyCalories: dailyCalNum,
      },
      createdAt: profile?.createdAt || new Date().toISOString(),
    };

    await saveProfile(newProfile);
    Alert.alert('Đã lưu mục tiêu');
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Mục tiêu</Text>
        <Field label="Cân nặng mục tiêu (kg)">
          <TextInput style={styles.input} value={targetWeight} onChangeText={setTargetWeight} keyboardType="numeric" />
        </Field>
        <Field label="Thời hạn (YYYY-MM-DD)">
          <TextInput style={styles.input} value={targetDate} onChangeText={setTargetDate} placeholder="2025-12-31" />
        </Field>
        <Field label="Calo/ngày">
          <TextInput style={styles.input} value={dailyCalories} onChangeText={setDailyCalories} keyboardType="numeric" />
        </Field>
        <TouchableOpacity style={styles.saveBtn} onPress={persist}>
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
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 16, color: Colors.light.text },
  field: { marginBottom: 14 },
  fieldLabel: { marginBottom: 6, fontWeight: '500', color: Colors.light.text },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.light.text,
  },
  saveBtn: {
    marginTop: 10,
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
