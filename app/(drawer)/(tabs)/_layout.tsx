import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

// Màu sắc ví dụ (bạn có thể dùng file Colors của mình)
const TINT_COLOR = '#C1121F';
const SECONDARY_COLOR = '#669BBC';
const TAB_BACKGROUND = '#FFFFFF';

export default function Layout_Tabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TINT_COLOR,
        tabBarInactiveTintColor: SECONDARY_COLOR,
        tabBarStyle: {
          backgroundColor: TAB_BACKGROUND,
          borderTopColor: '#E0E0E0',
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(tab)/MealHistory" // Cần file (tabs)/history.tsx
        options={{
          title: 'Nhật ký',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ================================================= */}
      {/* NÚT "THÊM" TRUNG TÂM */}
      {/* ================================================= */}
      <Tabs.Screen
        name="(add)/index" // Cần thư mục (tabs)/(add)/index.tsx
        options={{
          title: 'Thêm',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons
              name="add-circle"
              size={size * 1.5} // Icon lớn hơn bình thường
              color={TINT_COLOR} // Luôn có màu nhấn
            />
          ),
          tabBarLabel: () => null, // Ẩn chữ "Thêm"
        }}
      />
      {/* ================================================= */}

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Khám phá',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile" // Cần file (tabs)/profile.tsx
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Ẩn tất cả các màn hình phụ khác khỏi tab bar */}
      <Tabs.Screen name="details" options={{ href: null }} />
      <Tabs.Screen name="food_recognition" options={{ href: null }} />
      <Tabs.Screen name="MealLog" options={{ href: null }} />
      <Tabs.Screen name="camera" options={{ href: null }} />
      <Tabs.Screen name="Recipes" options={{ href: null }} />
      <Tabs.Screen name="MealHistory" options={{ href: null }} />
      <Tabs.Screen name="KetQuaAI" options={{ href: null }} />
      <Tabs.Screen name="ChoAITraKetqua" options={{ href: null }} />
      {/* ... ẩn tất cả các file khác nếu cần ... */}

    </Tabs>
  );
}