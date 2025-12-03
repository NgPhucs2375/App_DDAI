import { UserService } from '@/src/services/api'; // Import Service
import { useUserStore } from '@/src/store/userStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const userId = useUserStore(s => s.profile.id);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleChange = async () => {
    if (!oldPass || !newPass) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ');
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
      return;
    }

    try {
        // GỌI API ĐỔI PASS
        const res = await UserService.changePassword(Number(userId), oldPass, newPass);
        
        if (res && res.message) {
            Alert.alert('Thành công', 'Mật khẩu đã được thay đổi!');
            router.back();
        } else {
            Alert.alert('Thất bại', res?.detail || 'Mật khẩu cũ không đúng');
        }
    } catch (e) {
        Alert.alert('Lỗi', 'Không kết nối được Server');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đổi Mật Khẩu 🔒</Text>
      
      <TextInput placeholder="Mật khẩu hiện tại" value={oldPass} onChangeText={setOldPass} secureTextEntry style={styles.input} />
      <TextInput placeholder="Mật khẩu mới" value={newPass} onChangeText={setNewPass} secureTextEntry style={styles.input} />
      <TextInput placeholder="Xác nhận mật khẩu mới" value={confirmPass} onChangeText={setConfirmPass} secureTextEntry style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={handleChange}>
        <Text style={styles.buttonText}>Cập nhật ngay</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent:'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign:'center' },
  input: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  button: { backgroundColor: '#C1121F', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});