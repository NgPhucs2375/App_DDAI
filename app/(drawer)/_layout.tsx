// Tệp: app/(drawer)/_layout.tsx
// Luôn import dòng này ở trên cùng khi dùng drawer
import 'react-native-gesture-handler';

import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false, // Ẩn header mặc định, vì HomeScreen của bạn đã có
        drawerStyle: {
          backgroundColor: '#f8f8f8',
          width: 260, // Bạn có thể đổi độ rộng của sidebar ở đây
        },
        drawerActiveTintColor: '#0288D1', // Màu chữ khi được chọn
        drawerLabelStyle: {
          fontSize: 16,
        },
      }}
    >
      {/* Dòng này trỏ đến toàn bộ cụm Tabs của bạn */}
      <Drawer.Screen
        name="(tabs)" // Tên này phải khớp với tên thư mục (tabs) của bạn
        options={{
          drawerLabel: 'Trang Chính', // Tên sẽ hiển thị trong sidebar
          title: 'Trang Chính',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* SAU NÀY: Nếu bạn muốn thêm màn hình khác vào sidebar 
        (ví dụ: "Cài đặt"), bạn sẽ tạo tệp `app/(drawer)/settings.tsx`
        và thêm một <Drawer.Screen name="settings" ... /> nữa ở đây.
      */}

    </Drawer>
  );
}