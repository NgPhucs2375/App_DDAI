import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/theme';
import { UserService } from '@/src/services/api';
import { useUserStore } from '@/src/store/userStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AllergiesScreen() {
  const router = useRouter();
  const { profile, setProfile } = useUserStore();
  
  // State quản lý danh sách dị ứng
  const [allergies, setAllergies] = useState<string[]>(profile.allergies || []);
  const [input, setInput] = useState('');

  const addAllergy = () => {
    const v = input.trim();
    if (!v) return;
    if (!allergies.includes(v)) {
        setAllergies([...allergies, v]);
    }
    setInput('');
  };

  const removeAllergy = (item: string) => {
    setAllergies(allergies.filter(a => a !== item));
  };

  const handleSave = async () => {
    try {
        // Chuyển mảng thành chuỗi để gửi lên Server (VD: "Tôm,Cua")
        const allergyString = allergies.join(",");

        await UserService.updateProfile(Number(profile.id), {
            allergies: allergyString,
            // Cần gửi kèm các thông số khác để không bị lỗi thiếu field (tùy backend check)
            height: profile.heightCm,
            weight: profile.weightKg
        });

        // Cập nhật Store
        setProfile({ ...profile, allergies: allergies });
        
        Alert.alert('Thành công', 'Đã lưu danh sách dị ứng!');
        router.back();
    } catch (e) {
        Alert.alert("Lỗi", "Không lưu được.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Quản lý Dị ứng ⚠️</Text>
        <Text style={styles.sub}>Nhập các món bạn bị dị ứng để AI cảnh báo.</Text>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="VD: Tôm, Đậu phộng..."
          />
          <TouchableOpacity style={styles.addBtn} onPress={addAllergy}>
            <Text style={styles.addText}>+ Thêm</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chipWrap}>
          {allergies.map(a => (
            <TouchableOpacity key={a} style={styles.chip} onPress={() => removeAllergy(a)}>
              <Text style={styles.chipText}>{a}  ×</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.light.text },
  sub: { color: '#666', marginBottom: 20, marginTop: 5 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#eee', padding: 12, fontSize: 16 },
  addBtn: { backgroundColor: Colors.light.tint, justifyContent: 'center', paddingHorizontal: 20, borderRadius: 10 },
  addText: { color: '#fff', fontWeight: 'bold' },
  
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: '#FFEBEE', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#FFCDD2' },
  chipText: { color: '#D32F2F', fontWeight: '500' },
  
  saveBtn: { marginTop: 40, backgroundColor: Colors.light.tint, paddingVertical: 15, borderRadius: 30, alignItems: 'center', elevation: 2 },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});