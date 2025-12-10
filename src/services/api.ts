// 👇 CẤU HÌNH API URL TRỰC TIẾP TẠI ĐÂY (Để tránh lỗi import vòng vo)
export const API_URL = 'https://app-ddai.onrender.com'; 

// Hàm helper để gọi API (POST)
const post = async (endpoint: string, body: any) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await response.json();
  } catch (error) {
    console.error(`Lỗi POST ${endpoint}:`, error);
    return null;
  }
};

// Hàm helper để gọi API (GET)
const get = async (endpoint: string) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    return await response.json();
  } catch (error) {
    console.error(`Lỗi GET ${endpoint}:`, error);
    return null;
  }
};

// --- CÁC SERVICES ---

export const AuthService = {
  login: (email: string, pass: string) => post('/auth/login', { email, password: pass }),
  register: (email: string, pass: string, name: string) => post('/auth/register', { email, password: pass, full_name: name }),
};

export const MealService = {
   // Thêm món ăn
   add: (data: { user_id: number; mealType: string; items: string; calories: number; protein?: number; carbs?: number; fat?: number }) => 
    post('/meals/', data),

   // Báo cáo ngày
   getDailyReport: (user_id: number) => get(`/report/daily/${user_id}`),
  
   // Lịch sử ăn uống
   getHistory: (user_id: number, date?: string) => get(`/meals/history/${user_id}${date ? `?date=${date}` : ''}`),

   // Báo cáo lịch sử
   getHistoricalReport: (user_id: number, start_date: string, end_date: string) => 
    get(`/report/history/${user_id}?start_date=${start_date}&end_date=${end_date}`),

   // Xóa món ăn
   delete: (mealId: number) => {
    return fetch(`${API_URL}/meals/${mealId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.ok).catch(() => false);
  },
};

export const AIService = {
  // 👇 CẬP NHẬT: Gửi thêm userId để check dị ứng
  analyze: (base64: string, userId: number) => post('/analyze/', { image_base64: base64, user_id: userId }),

  // 👇 CẬP NHẬT: Chatbot ngữ cảnh (gửi userId)
  chat: (userId: number, message: string) => post('/chat', { user_id: userId, message: message }), 
  
  // Phân tích báo cáo
  analyzeReport: (user_id: number, report_data: any) => post(`/analyze/report/${user_id}`, report_data),
};

export const CommunityService = {
   getPosts: () => get('/community/posts'),
   likePost: (postId: string) => post(`/community/posts/${postId}/like`, {}),
   createPost: (userName: string, content: string) => post('/community/posts/', { user_name: userName, content: content }),
   sendFeedback: (userId: number, userName: string, content: string) => post('/feedback/', { user_id: userId, user_name: userName, content: content }),
   getFeedbacks: () => get('/admin/feedbacks'),
};

export const UserService = {
   getProfile: (user_id: number) => get(`/user/${user_id}`),
   updateProfile: (user_id: number, data: any) => post(`/user/${user_id}/update`, data),
   changePassword: (user_id: number, oldPass: string, newPass: string) => post(`/auth/change-password/${user_id}`, { old_password: oldPass, new_password: newPass }),
};

export const FoodService = {
   search: (query: string) => get(`/food/search?query=${query}`),
};