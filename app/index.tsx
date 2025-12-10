import { Colors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootIndex() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      // 👇 DÒNG LỆNH GỠ RỐI (QUAN TRỌNG):
      // Bỏ comment dòng dưới đây, chạy App 1 lần để Reset, sau đó comment lại.
      // await AsyncStorage.clear(); 

      // 1. Kiểm tra xem đã xem Intro chưa
      const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
      
      // 2. Kiểm tra xem đã Đăng nhập chưa
      const logged = await AsyncStorage.getItem('isLoggedIn');

      console.log("Debug Status -> HasSeen:", hasSeen, "| LoggedIn:", logged);

      // Nếu hasSeen là null => Chưa xem => Lần đầu mở App
      setIsFirstLaunch(hasSeen === null); 
      setIsLoggedIn(logged === 'true');
    } catch (e) {
      setIsFirstLaunch(false);
      setIsLoggedIn(false);
    }
  };

  if (isFirstLaunch === null || isLoggedIn === null) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor: '#fff'}}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  // Ưu tiên 1: Intro
  if (isFirstLaunch) {
    return <Redirect href="/onboarding" />;
  }

  // Ưu tiên 2: Login
  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  // Ưu tiên 3: Vào App
  return <Redirect href="/(drawer)/(tabs)" />;
}