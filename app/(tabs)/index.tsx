import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
export default function HomeScreen() {
  
  // Khai báo state để lưu tên và lời chào
  const [name, setName] = useState('');
  const router = useRouter();

  // hàm check input và hiển thị lời chào
  // const handlePress = () => {
  //   if (name.trim() === '') {
  //     setGreeting('Vui lòng nhập tên của bạn');
  //   } else {
  //     setGreeting(`Xin chào ${name}, chào mừng bạn đến với React Native!`);
  //   }
  // };

  const handleNavigate =() =>{
    if(name.trim() ===''){
      alert('Vui lòng nhập tên của bạn');
      return
    }

    // truyền dữ liệu sang màn hình Details
    router.push({
      pathname:'/details',
      params:{userName:name},
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demo React Native</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập tên của bạn"
        value={name}
        onChangeText={setName}
      />

      {/* <Button title="Xác nhận" onPress={handlePress} />

      {greeting ? <Text style={styles.greeting}>{greeting}</Text> : null}


      <Button 
      title="Sang trang chi tiết"
      onPress={()=> router.push('/(tabs)/details')}/> */}

      <Button 
      title="Chi tiết"
      onPress={handleNavigate}/>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#51586679',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  greeting: {
    fontSize: 20,
    color: 'yellow',
    marginTop: 15,
  },
});
