import { AuthService } from '@/src/services/api'; // Import Service API
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
    if (!email || !password || !name) {
      setError('Vui lòng nhập đầy đủ: Tên, Email và Mật khẩu');
      return;
    }
    setLoading(true);
    
    try {
      // --- GỌI API ĐĂNG KÝ ---
      const res = await AuthService.register(email, password, name);

      if (res && res.message === "Đăng ký thành công") {
        Alert.alert('Thành công', 'Tài khoản đã được tạo. Vui lòng đăng nhập ngay!');
        router.replace('/login'); // Chuyển về màn hình đăng nhập
      } else {
        // Hiển thị lỗi từ Server (ví dụ: Email đã tồn tại)
        setError(res?.detail || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (e) {
      console.error(e);
      setError('Lỗi kết nối đến Server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký Tài khoản</Text>

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
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#FAFAFA',
    fontSize: 16,
  },
  button: {
    height: 50,
    backgroundColor: '#C1121F', // Dùng màu đỏ chủ đạo của App bạn
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
  error: {
    color: '#D32F2F',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
});