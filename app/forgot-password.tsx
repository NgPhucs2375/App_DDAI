import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleReset = () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email của bạn');
      return;
    }
    // Mock logic gửi email
    Alert.alert(
      'Đã gửi yêu cầu', 
      `Một liên kết đặt lại mật khẩu đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư.`,
      [
        { text: 'OK', onPress: () => router.back() } // Quay lại màn hình đăng nhập
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên Mật Khẩu?</Text>
      <Text style={styles.subtitle}>Nhập email để nhận hướng dẫn lấy lại mật khẩu.</Text>

      <TextInput
        placeholder="Nhập email của bạn"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Gửi yêu cầu</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.link}>
        <Text style={styles.linkText}>Quay lại Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  input: {
    height: 50, borderColor: '#ddd', borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 15, marginBottom: 20, backgroundColor: '#fafafa', fontSize: 16
  },
  button: {
    height: 50, backgroundColor: '#C1121F', borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginBottom: 15
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  link: { alignItems: 'center', marginTop: 10 },
  linkText: { color: '#007AFF', fontSize: 16 },
});