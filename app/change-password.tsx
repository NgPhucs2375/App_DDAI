import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppHeader from '../components/AppHeader'; // Giả sử bạn có component này

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleChange = () => {
    if (!oldPass || !newPass || !confirmPass) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
      return;
    }
    // Mock logic đổi mật khẩu
    Alert.alert('Thành công', 'Mật khẩu đã được thay đổi!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={styles.container}>
      <AppHeader /> 
      <View style={styles.content}>
        <Text style={styles.title}>Đổi Mật Khẩu</Text>
        
        <TextInput
          placeholder="Mật khẩu hiện tại"
          value={oldPass}
          onChangeText={setOldPass}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          placeholder="Mật khẩu mới"
          value={newPass}
          onChangeText={setNewPass}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          placeholder="Xác nhận mật khẩu mới"
          value={confirmPass}
          onChangeText={setConfirmPass}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleChange}>
          <Text style={styles.buttonText}>Cập nhật mật khẩu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  input: {
    backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15,
    borderWidth: 1, borderColor: '#ddd'
  },
  button: {
    backgroundColor: '#C1121F', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});