import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/theme';
import { UserService } from '@/src/services/api'; // <--- Import UserService
import { useUserStore } from '@/src/store/userStore';
import { Gender } from '@/src/types/profile';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  
  // Lấy profile và hàm setProfile từ Store
  const { profile, setProfile } = useUserStore();

  // Khởi tạo state form từ profile trong Store
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [age, setAge] = useState(profile.age?.toString() || '');
  const [height, setHeight] = useState(profile.heightCm?.toString() || '');
  const [weight, setWeight] = useState(profile.weightKg?.toString() || '');
  const [gender, setGender] = useState<Gender>(profile.gender || 'Khác');

  const handleSave = async () => {
    const ageNum = age ? Number(age) : 0;
    const heightNum = height ? Number(height) : 0;
    const weightNum = weight ? Number(weight) : 0;

    // Validate
    if (heightNum && (heightNum < 50 || heightNum > 250)) {
      Alert.alert('Lỗi', 'Chiều cao không hợp lệ (50-250 cm)');
      return;
    }
    if (weightNum && (weightNum < 20 || weightNum > 400)) {
      Alert.alert('Lỗi', 'Cân nặng không hợp lệ (20-400 kg)');
      return;
    }
    if (!ageNum || !heightNum || !weightNum) {
        Alert.alert('Lưu ý', 'Vui lòng nhập đủ Tuổi, Chiều cao, Cân nặng để tính Calo chuẩn xác!');
        return;
    }

    try {
        // --- GỌI API CẬP NHẬT LÊN SERVER ---
        // Backend cần đủ các trường để tính TDEE. 
        // Vì UI chưa có nhập "Mức độ vận động" và "Cân nặng mục tiêu", ta lấy mặc định hoặc từ profile cũ.
        const res = await UserService.updateProfile(Number(profile.id), {
            height: heightNum,
            weight: weightNum,
            age: ageNum,
            gender: gender,
            target_weight: profile.goals?.targetWeightKg || weightNum, // Mặc định giữ nguyên nếu không có
            activity_level: 'Vừa' // Mặc định là Vừa
        });

        if (res && res.new_target_calories) {
            // Cập nhật lại Store Local với dữ liệu mới và Calo mới từ Server trả về
            setProfile({
                ...profile,
                fullName,
                age: ageNum,
                heightCm: heightNum,
                weightKg: weightNum,
                gender,
                goals: { 
                    ...profile.goals,
                    dailyCalories: res.new_target_calories // <--- Cập nhật Calo chuẩn từ Server
                }
            });

            Alert.alert('Thành công', `Đã cập nhật!\nMục tiêu Calo mới của bạn: ${res.new_target_calories} kcal`);
            router.back();
        } else {
            Alert.alert('Lỗi', 'Không cập nhật được hồ sơ trên Server.');
        }
    } catch (error) {
        console.error(error);
        Alert.alert('Lỗi', 'Không kết nối được Server.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Chỉnh sửa hồ sơ ✏️</Text>
        
        <Field label="Họ và tên">
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Nhập tên của bạn" />
        </Field>
        
        <View style={styles.row}>
            <View style={{flex: 1, marginRight: 10}}>
                <Field label="Tuổi">
                    <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="VD: 25" />
                </Field>
            </View>
            <View style={{flex: 1}}>
                <Field label="Giới tính">
                    <View style={styles.genderRow}>
                        {(['Nam','Nữ'] as Gender[]).map(g => (
                        <TouchableOpacity key={g} style={[styles.genderBtn, gender === g && styles.genderBtnActive]} onPress={() => setGender(g)}>
                            <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                        </TouchableOpacity>
                        ))}
                    </View>
                </Field>
            </View>
        </View>

        <View style={styles.row}>
            <View style={{flex: 1, marginRight: 10}}>
                <Field label="Chiều cao (cm)">
                    <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" placeholder="VD: 170" />
                </Field>
            </View>
            <View style={{flex: 1}}>
                <Field label="Cân nặng (kg)">
                    <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="VD: 65" />
                </Field>
            </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Lưu & Tính Calo (Server)</Text>
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
  fieldLabel: { marginBottom: 8, fontWeight: '600', color: '#555', fontSize: 14 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  genderBtnActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  genderText: { color: '#555', fontWeight: '600' },
  genderTextActive: { color: '#fff' },
  saveBtn: {
    marginTop: 20,
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.light.tint,
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 4},
    elevation: 5
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});