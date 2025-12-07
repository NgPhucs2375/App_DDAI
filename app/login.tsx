import { API_URL } from '@/src/constants/ApiConfig'; // Import địa chỉ IP
import { AuthService } from '@/src/services/api';
import { useUserStore } from '@/src/store/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State để hiển thị trạng thái kết nối Server
  const [serverStatus, setServerStatus] = useState<string>('Đang dò tìm server Python...');
  const [isConnected, setIsConnected] = useState(false);

  // --- HÀM TỰ ĐỘNG KIỂM TRA SERVER ---
  useEffect(() => {
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    try {
      console.log(`Đang thử kết nối tới: ${API_URL}/products/`);
      // Gọi thử API lấy danh sách sản phẩm
      const response = await fetch(`${API_URL}/meals/`);
      
      if (response.ok) {
        const data = await response.json();
        setIsConnected(true);
        setServerStatus(`✅ Đã kết nối thành công!\nBackend đang chạy ngon lành.\n(Tìm thấy ${data.length} sản phẩm trong DB)`);
      } else {
        setServerStatus(`⚠️ Tìm thấy Server nhưng bị lỗi: ${response.status}`);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      setServerStatus(`❌ Không thể kết nối tới ${API_URL}\n1. Kiểm tra lại IPv4 trong ApiConfig.ts\n2. Đảm bảo server đang chạy với lệnh --host 0.0.0.0`);
    }
  };
  // ------------------------------------

  const handleLogin = async() => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin');
      return;
    }

    // Gọi API Login thật
    const res = await AuthService.login(email, password);

    if (res && res.message === "Đăng nhập thành công") {
        // LƯU USER_ID VÀO STORE ĐỂ DÙNG TOÀN APP
        useUserStore.getState().setLogin(true, 'token_demo'); 
        useUserStore.getState().setProfile({ 
            id: res.user_id, // <--- QUAN TRỌNG: Lưu ID thật từ DB
            fullName: res.full_name,
            goals: { dailyCalories: res.target_calories },
            isAdmin: res.is_admin
        });
        await AsyncStorage.setItem('isLoggedIn', 'true');
        if (res.is_admin) {
            Alert.alert('Xin chào Sếp!', 'Đang vào trang quản trị...');
            router.replace('/admin/dashboard'); // Vào Admin
        } else {
            Alert.alert('Thành công', `Chào mừng ${res.full_name}!`);
            router.replace('/'); // Vào trang chủ khách hàng
        }


    } else {
        Alert.alert('Thất bại', res?.detail || 'Sai email hoặc mật khẩu');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Nhập</Text>

      {/* --- KHUNG TEST KẾT NỐI (Chỉ dùng cho Demo) --- */}
      <View style={[styles.statusBox, { backgroundColor: isConnected ? '#d4edda' : '#f8d7da' }]}>
        <Text style={{fontWeight: 'bold', marginBottom: 5}}>TRẠNG THÁI SERVER:</Text>
        <Text style={{color: '#333'}}>{serverStatus}</Text>
        {!isConnected && (
            <TouchableOpacity onPress={checkServerConnection} style={styles.retryBtn}>
                <Text style={{color: 'blue'}}>Thử lại</Text>
            </TouchableOpacity>
        )}
      </View>
      {/* ----------------------------------------------- */}

      <TextInput
        placeholder='Email (admin@gmail.com)'
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType='email-address'
        autoCapitalize='none'
      />
      <TextInput
        placeholder='Mật khẩu (123456)'
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng Nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 30, backgroundColor: '#ecf0f1' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 10, padding: 12, marginBottom: 15, backgroundColor: '#fff' },
  button: { backgroundColor: '#1abc9c', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  link: { color: '#2980b9', textAlign: 'center', marginTop: 10 },
  
  // Style cho khung status
  statusBox: { padding: 15, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  retryBtn: { marginTop: 10, alignSelf: 'flex-start' }
});