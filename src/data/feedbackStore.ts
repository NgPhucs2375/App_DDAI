import AsyncStorage from '@react-native-async-storage/async-storage';

const FEEDBACK_KEY = 'app_feedbacks';

export type Feedback = {
  id: string;
  user: string;
  content: string;
  date: string;
};

// Tải danh sách phản hồi
export const loadFeedbacks = async (): Promise<Feedback[]> => {
  try {
    const json = await AsyncStorage.getItem(FEEDBACK_KEY);
    return json ? JSON.parse(json) : [];
  } catch { return []; }
};

// Gửi phản hồi mới (Dùng cho User)
export const sendFeedback = async (content: string, userName: string) => {
  const current = await loadFeedbacks();
  const newItem: Feedback = {
    id: Date.now().toString(),
    user: userName,
    content,
    date: new Date().toISOString().split('T')[0], // Lấy ngày YYYY-MM-DD
  };
  // Thêm vào đầu danh sách
  await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify([newItem, ...current]));
};

// Xóa phản hồi (Dùng cho Admin)
export const deleteFeedback = async (id: string) => {
  const current = await loadFeedbacks();
  const updated = current.filter(f => f.id !== id);
  await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(updated));
  return updated;
};