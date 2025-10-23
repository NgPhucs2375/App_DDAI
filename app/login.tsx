import { router } from 'expo-router';
import React from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// định nghĩa style
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#ecf0f1',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#1abc9c',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    color: '#2980b9',
    textAlign: 'center',
    marginTop: 10,
  },
});



export default function LoginScreen(){
    const [email,setEmail]=React.useState('');
    const [password,setPassword]=React.useState('');

    const handleLogin=()=>{
        // check email 
        const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // check rỗng
        if(!email || !password){
            Alert.alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        // check định dạng email
        if(!emailRegex.test(email)){
            Alert.alert('Email không hợp lệ');
            return;
        }
        // Ví dụ xác thực đơn giản (sau có thể thay bằng gọi API)
        // TEST tạm thời
        if (email === 'admin@gmail.com' && password === '123456') {
        Alert.alert('Thành công', 'Đăng nhập thành công!');
        router.replace('/(tabs)'); // chuyển sang layout Tabs
        } else {
        Alert.alert('Lỗi', 'Email hoặc mật khẩu sai!');
        }
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Đăng Nhập</Text>

                <TextInput
                    placeholder='Email'
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    keyboardType='email-address'
                    />
                 <TextInput
                    placeholder='Mật khẩu'
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
}