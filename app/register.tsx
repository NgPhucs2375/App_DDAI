import { useUserStore } from '@/src/store/userStore';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onRegister = async () => {
    setError(null);
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }
    setLoading(true);
    try {
      // Tạo ID và Profile mặc định
      const defaultProfile = {
        id: Date.now().toString(),
        fullName: name || 'User ' + Date.now().toString().slice(-4),
        goals: { dailyCalories: 2000 },
        createdAt: new Date().toISOString(),
        // Các trường khác sẽ dùng mặc định của Store (đã định nghĩa trong userStore.ts)
      };

      // 1. Dùng Store để lưu trạng thái đăng nhập và Profile
      useUserStore.getState().setProfile(defaultProfile);
      useUserStore.getState().setLogin(true, 'mock_token_' + Date.now()); 
      
      Alert.alert('Thành công', 'Đăng ký hoàn tất, đang chuyển đến trang chủ');
      router.replace('/'); // Chuyển sang root layout
    } catch (e) {
      console.error(e);
      setError('Đăng ký thất bại, thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ... (UI giữ nguyên) */}
      <Text style={styles.title}>Đăng ký</Text>

      <TextInput
        placeholder="Họ và tên"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoCapitalize="words"
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={onRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng ký</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/login')} style={styles.link}>
        <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (Styles giữ nguyên)
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  button: {
    height: 48,
    backgroundColor: '#0288D1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  link: {
    marginTop: 12,
    alignItems: 'center',
  },
  linkText: {
    color: '#0288D1',
  },
  error: {
    color: '#c00',
    marginBottom: 8,
    textAlign: 'center',
  },
});