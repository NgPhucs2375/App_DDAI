import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import React from 'react';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: Colors.light.tint,
        drawerStyle: { width: 280 },
      }}
    >
      {/* 1. Trang chủ (Tabs) */}
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Trang chủ',
          title: 'Trang chủ',
          drawerIcon: ({ size, color }: { size: number; color: string }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 2. Thêm món (Redirect sang MealLog) */}
      <Drawer.Screen
        name="meal-log"
        options={{
          drawerLabel: 'Thêm món ăn',
          title: 'Thêm món',
          drawerIcon: ({ size, color }: { size: number; color: string }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 3. Lịch sử (Redirect sang History) */}
      <Drawer.Screen
        name="history"
        options={{
          drawerLabel: 'Lịch sử bữa ăn',
          title: 'Lịch sử',
          drawerIcon: ({ size, color }: { size: number; color: string }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 4. Báo cáo */}
      <Drawer.Screen
        name="reports"
        options={{
          drawerLabel: 'Báo cáo sức khỏe',
          title: 'Báo cáo',
          drawerIcon: ({ size, color }: { size: number; color: string }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 5. Cài đặt */}
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: 'Cài đặt',
          title: 'Cài đặt',
          drawerIcon: ({ size, color }: { size: number; color: string }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Các file ẩn khác trong thư mục (drawer) nếu có */}
      <Drawer.Screen name="profile" options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="recipes" options={{ drawerItemStyle: { display: 'none' } }} />
    </Drawer>
  );
}