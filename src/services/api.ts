import { API_URL } from '@/src/constants/ApiConfig'; // File chứa IP của bạn

// Hàm hỗ trợ gọi API cho gọn
const post = async (endpoint: string, body: any) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await response.json();
  } catch (error) {
    console.error(`Lỗi gọi API ${endpoint}:`, error);
    return null;
  }
};

const get = async (endpoint: string) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    return await response.json();
  } catch (error) {
    console.error(`Lỗi gọi API ${endpoint}:`, error);
    return null;
  }
};

// --- CÁC HÀM GỌI API CỤ THỂ ---

export const AuthService = {
  login: (email: string, pass: string) => post('/auth/login', { email, password: pass }),
  register: (email: string, pass: string, name: string) => post('/auth/register', { email, password: pass, full_name: name }),
};

export const MealService = {
  // Lưu bữa ăn (cần user_id)
  add: (data: { user_id: number; mealType: string; items: string; calories: number; protein?: number; carbs?: number; fat?: number }) => 
    post('/meals/', data),
  
  // Lấy báo cáo hàng ngày
  getDailyReport: (user_id: number) => get(`/report/daily/${user_id}`),
  
  // Lấy lịch sử
  getHistory: (user_id: number) => get(`/meals/history/${user_id}`),

  // Lấy báo cáo lịch sử trong khoảng thời gian
  getHistoricalReport: (user_id: number, start_date: string, end_date: string) => 
    get(`/report/history/${user_id}?start_date=${start_date}&end_date=${end_date}`),
};

export const AIService = {
  analyze: (base64: string) => post('/analyze/', { image_base64: base64 }),

  chat: (msg: string, ctx: string) => post('/chat', { message: msg, context: ctx }),
  analyzeReport: (user_id: number, report_data: any) => post(`/analyze/report/${user_id}`, report_data),
};

export const CommunityService = {
  // Lấy danh sách bài viết
  getPosts: () => get('/community/posts'),

  // Thả tim
  likePost: (postId: string) => post(`/community/posts/${postId}/like`, {}),
  createPost: (userName: string, content: string) => 
    post('/community/posts/', { user_name: userName, content: content }),
  // Gửi phản hồi (Feedback)
  sendFeedback: (userId: number, userName: string, content: string) => 
    post('/feedback/', { user_id: userId, user_name: userName, content: content }),
    
  // Admin lấy danh sách phản hồi
  getFeedbacks: () => get('/admin/feedbacks'),
};

export const UserService = {
  // Lấy thông tin user
  getProfile: (user_id: number) => get(`/user/${user_id}`),
  
  // Cập nhật chiều cao, cân nặng -> Tính lại TDEE
  updateProfile: (user_id: number, data: any) => post(`/user/${user_id}/update`, data),
  
  // Đổi mật khẩu
  changePassword: (user_id: number, oldPass: string, newPass: string) => 
    post(`/auth/change-password/${user_id}`, { old_password: oldPass, new_password: newPass }),
};

export const FoodService = {
  // Tìm kiếm món ăn
  search: (query: string) => get(`/food/search?query=${query}`),
};

export function getFeedbacks() {
  throw new Error('Function not implemented.');
}

export function getPosts() {
  throw new Error('Function not implemented.');
}
export function likePost(arg0: string) {
  throw new Error('Function not implemented.');
}

