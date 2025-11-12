import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../constants/theme';
import { loadProfile, saveProfile } from '../../src/data/profileStore';
import { Gender, UserProfile } from '../../src/types/profile';

export default function EditProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<Gender>('Khác');

  useEffect(() => {
    loadProfile().then(p => {
      setProfile(p);
      if (p) {
        setFullName(p.fullName || '');
        setAge(p.age?.toString() || '');
        setHeight(p.heightCm?.toString() || '');
        setWeight(p.weightKg?.toString() || '');
        setGender(p.gender || 'Khác');
      }
    });
  }, []);

  const persist = async () => {
    const ageNum = age ? Number(age) : undefined;
    const heightNum = height ? Number(height) : undefined;
    const weightNum = weight ? Number(weight) : undefined;

    if (heightNum && (heightNum < 50 || heightNum > 250)) {
      Alert.alert('Chiều cao không hợp lệ (50-250 cm)');
      return;
    }
    if (weightNum && (weightNum < 20 || weightNum > 400)) {
      Alert.alert('Cân nặng không hợp lệ (20-400 kg)');
      return;
    }

    const newProfile: UserProfile = {
      id: profile?.id || 'local-user',
      fullName: fullName || undefined,
      age: ageNum,
      heightCm: heightNum,
      weightKg: weightNum,
      gender,
      allergies: profile?.allergies || [],
      goals: profile?.goals,
      createdAt: profile?.createdAt || new Date().toISOString(),
    };

    await saveProfile(newProfile);
    Alert.alert('Đã lưu hồ sơ');
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
        <Field label="Họ và tên">
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Tên" />
        </Field>
        <Field label="Tuổi">
          <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="Ví dụ: 25" />
        </Field>
        <Field label="Chiều cao (cm)">
          <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" placeholder="Ví dụ: 170" />
        </Field>
        <Field label="Cân nặng (kg)">
          <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="Ví dụ: 60" />
        </Field>
        <Field label="Giới tính">
          <View style={styles.genderRow}>
            {(['Nam','Nữ','Khác'] as Gender[]).map(g => (
              <TouchableOpacity key={g} style={[styles.genderBtn, gender === g && styles.genderBtnActive]} onPress={() => setGender(g)}>
                <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>
        <TouchableOpacity style={styles.saveBtn} onPress={persist}>
          <Text style={styles.saveText}>Lưu</Text>
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
  genderRow: { flexDirection: 'row', gap: 8 },
  genderBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  genderBtnActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  genderText: { color: Colors.light.text },
  genderTextActive: { color: '#fff' },
  saveBtn: {
    marginTop: 10,
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
