// Tệp: app/(drawer)/_layout.tsx
// Luôn import dòng này ở trên cùng khi dùng drawer
import 'react-native-gesture-handler';

import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: '#f8f8f8', width: 260 },
        drawerActiveTintColor: '#0288D1',
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      {/* Nhóm Tabs (trang chủ, explore, profile trong tab bar) */}
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

      {/* PROFILE trong Drawer */}
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Hồ sơ',
          title: 'Hồ sơ',
          drawerIcon: ({ size, color }: { size: number; color: string }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Nhật ký bữa ăn */}
      <Drawer.Screen
        name="meal-log"
        options={{
          drawerLabel: 'Nhật ký bữa ăn',
          title: 'Nhật ký bữa ăn',
          drawerIcon: ({ size, color }: { size: number; color: string }) => (
            <Ionicons name="restaurant-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Lịch sử bữa ăn */}
      <Drawer.Screen
        name="meal-history"
        options={{
          drawerLabel: 'Lịch sử bữa ăn',
          title: 'Lịch sử bữa ăn',
          drawerIcon: ({ size, color }: { size: number; color: string }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Công thức nấu ăn */}
      <Drawer.Screen
        name="recipes"
        options={{
          drawerLabel: 'Công thức',
          title: 'Công thức nấu ăn',
          drawerIcon: ({ size, color }: { size: number; color: string }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />

      {/** (đã dọn) profile-screen.tsx – không còn cần ẩn route dư thừa */}
 
      
      {/* SAU NÀY: Nếu bạn muốn thêm màn hình khác vào sidebar 
        (ví dụ: "Cài đặt"), bạn sẽ tạo tệp `app/(drawer)/settings.tsx`
        và thêm một <Drawer.Screen name="settings" ... /> nữa ở đây.
      */}

    </Drawer>
  );
}