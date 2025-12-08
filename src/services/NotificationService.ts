import * as Notifications from 'expo-notifications';

// 1. Cấu hình cách thông báo hiển thị
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // 👇 SỬA LỖI 1: Thêm 2 thuộc tính bắt buộc này
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH, 
  }),
});

export const NotificationService = {
  // --- A. Xin quyền thông báo ---
  requestPermissions: async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }
    return true;
  },

  // --- B. Đặt lịch nhắc nhở ---
  scheduleDailyReminder: async (title: string, body: string, hour: number, minute: number) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          sound: true, // Bật âm thanh
        },
        // 👇 SỬA LỖI 2: Dùng ép kiểu 'any' hoặc 'CalendarTriggerInput' để TypeScript không bắt bẻ
        trigger: {
          hour: hour,
          minute: minute,
          repeats: true,
        } as any, 
      });
      console.log(`✅ Đã đặt lịch: ${hour}:${minute} - ${title}`);
    } catch (error) {
      console.error("Lỗi đặt lịch:", error);
    }
  },

  // --- C. Cài đặt trọn bộ lịch ăn uống ---
  setupDailyMeals: async () => {
    const hasPermission = await NotificationService.requestPermissions();
    if (!hasPermission) return;

    // Hủy hết lịch cũ để tránh trùng lặp
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Đặt lịch mới (Sáng - Trưa - Tối)
    await NotificationService.scheduleDailyReminder(
      "🌅 Chào buổi sáng!", 
      "Đừng quên nạp năng lượng cho ngày mới nhé 🍳", 
      7, 0 
    );

    await NotificationService.scheduleDailyReminder(
      "🍱 Đến giờ ăn trưa rồi!", 
      "Chụp ảnh bữa trưa để AI tính Calo ngay nào 📸", 
      11, 30
    );

    await NotificationService.scheduleDailyReminder(
      "🌙 Bữa tối nhẹ nhàng", 
      "Tổng kết calo hôm nay thôi. Bạn đã đạt mục tiêu chưa? 🥗", 
      18, 30
    );
  },

  // --- D. Tắt hết thông báo ---
  cancelAll: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("🔕 Đã hủy tất cả thông báo");
  }
};