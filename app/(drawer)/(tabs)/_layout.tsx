import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Layout_Tabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: Colors.light.icon,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#efefef',
          height: 60 + insets.bottom, 
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10, 
          paddingTop: 10,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 0,
        }
      }}
    >
      {/* 1. Trang chủ */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          // ĐÃ SỬA: Thêm type cho color và size
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />

      {/* 2. Nhật ký */}
      <Tabs.Screen
        name="MealHistory"
        options={{
          title: 'Nhật ký',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="calendar-outline" size={24} color={color} />
          ),
        }}
      />

      {/* 3. Nút THÊM (Nổi lên) */}
      <Tabs.Screen
        name="(add)/index"
        options={{
          title: 'Thêm',
          // Đối với nút giữa, ta không dùng color/size mặc định nên có thể để any hoặc khai báo đầy đủ
          tabBarIcon: ({ focused }: { focused: boolean; color: string; size: number }) => (
            <View
              style={{
                top: -20,
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: Colors.light.tint,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 5,
                shadowColor: Colors.light.tint,
                shadowOpacity: 0.3,
                shadowOffset: { width: 0, height: 4 },
                borderWidth: 4,
                borderColor: '#f5f5f5'
              }}
            >
              <Ionicons name="add" size={32} color="#fff" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />

      {/* 4. Khám phá */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Khám phá',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="compass-outline" size={24} color={color} />
          ),
        }}
      />

      {/* 5. Hồ sơ */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />

      {/* --- CÁC MÀN HÌNH ẨN --- */}
      <Tabs.Screen name="details" options={{ href: null }} />
      <Tabs.Screen name="MealLog" options={{ href: null }} />
      <Tabs.Screen name="Recipes" options={{ href: null }} />
      
    </Tabs>
  );
}