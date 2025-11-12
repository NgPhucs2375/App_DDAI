import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function Layout_Tabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Tốt! Giữ nguyên vì bạn có header tùy chỉnh riêng
        
        // Các dòng này không còn tác dụng vì header đã bị ẩn
        // headerStyle:{backgroundColor:'#1abc9c'},
        // headerTintColor:'white',

        // ===== ĐIỀU CHỈNH MÀU SẮC TAB BAR =====
        tabBarStyle: {
          backgroundColor: '#FFFFFF', // 1. Nền trắng sạch sẽ, hiện đại
          borderTopColor: '#E0E0E0', // Thêm 1 đường viền mỏng cho đẹp
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#C1121F',   // 2. Màu nhấn (Crimson Blaze) khi tab được chọn
        tabBarInactiveTintColor: '#669BBC', // 3. Màu phụ (Blue Marble) khi tab không được chọn
        // =====================================
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="details"
        options={{
          title: "Thông tin chi tiết",
          // Không muốn hiện trong tab bar
          href: null,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }} />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Khám phá",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }} />

      <Tabs.Screen
        name="profile"
        options={{
          // TÊN GỢI Ý: Nên đổi thành "Cá nhân" hoặc "Tài khoản"
          title: "Cá nhân", 
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }} />

      <Tabs.Screen
        name="food_recognition"
        options={{
          title: "Nhận diện", // Gợi ý: Rút gọn cho tab bar
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="fast-food" size={size} color={color} />
          ),
        }}
      />

      {/** Ẩn các màn hình phụ khỏi thanh tab, vẫn có thể navigate tới */}
      <Tabs.Screen
        name="FoodRecognitionScreen"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="MealLog"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="MealHistory"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="Recipes"
        options={{ href: null }}
      />
    </Tabs>
  );
}