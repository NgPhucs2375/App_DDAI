import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
      // Lưu trạng thái đăng nhập đơn giản
      await AsyncStorage.setItem('isLoggedIn', 'true');
      // (Tuỳ app bạn có thể lưu token / user ở đây)
  router.replace('/'); // chuyển sang root layout chứa drawer + tabs
    } catch (e) {
      console.error(e);
      setError('Đăng ký thất bại, thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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