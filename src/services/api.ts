import { API_URL } from '@/src/constants/ApiConfig'; // File chứa IP của bạn

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

 
export const AuthService = {
  login: (email: string, pass: string) => post('/auth/login', { email, password: pass }),
  register: (email: string, pass: string, name: string) => post('/auth/register', { email, password: pass, full_name: name }),
};

export const MealService = {
   add: (data: { user_id: number; mealType: string; items: string; calories: number; protein?: number; carbs?: number; fat?: number }) => 
    post('/meals/', data),
  
   getDailyReport: (user_id: number) => get(`/report/daily/${user_id}`),
  
   getHistory: (user_id: number) => get(`/meals/history/${user_id}`),

   getHistoricalReport: (user_id: number, start_date: string, end_date: string) => 
    get(`/report/history/${user_id}?start_date=${start_date}&end_date=${end_date}`),
};

export const AIService = {
  analyze: (base64: string) => post('/analyze/', { image_base64: base64 }),

  chat: (msg: string, ctx: string) => post('/chat', { message: msg, context: ctx }),
  analyzeReport: (user_id: number, report_data: any) => post(`/analyze/report/${user_id}`, report_data),
};

export const CommunityService = {
   getPosts: () => get('/community/posts'),

   likePost: (postId: string) => post(`/community/posts/${postId}/like`, {}),
  createPost: (userName: string, content: string) => 
    post('/community/posts/', { user_name: userName, content: content }),
   sendFeedback: (userId: number, userName: string, content: string) => 
    post('/feedback/', { user_id: userId, user_name: userName, content: content }),
    
   getFeedbacks: () => get('/admin/feedbacks'),
};

export const UserService = {
   getProfile: (user_id: number) => get(`/user/${user_id}`),
  
   updateProfile: (user_id: number, data: any) => post(`/user/${user_id}/update`, data),
  
   changePassword: (user_id: number, oldPass: string, newPass: string) => 
    post(`/auth/change-password/${user_id}`, { old_password: oldPass, new_password: newPass }),
};

export const FoodService = {
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

