import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { UserProfile } from '../types/profile';

interface UserState {
  isLoggedIn: boolean;
  token: string | null;
  isDarkMode: boolean;
  profile: UserProfile;
  streak: number;           // Số ngày liên tiếp
  lastLogDate: string | null; // Ngày ghi nhật ký gần nhất (YYYY-MM-DD)

  // Actions
  setLogin: (status: boolean, token?: string | null) => void;
  setProfile: (newProfile: Partial<UserProfile>) => void;
  setTheme: (isDark: boolean) => void;
  calculateTDEE: () => void;
  logout: () => void;
  updateStreak: () => void; // Hàm cập nhật streak
}

const DEFAULT_PROFILE: UserProfile = {
  id: '',
  email: '',
  fullName: 'Người dùng mới',
  age: 25,
  gender: 'Nam',
  heightCm: 170,
  weightKg: 65,
  activityLevel: 'Vừa',
  allergies: [],
  goals: { dailyCalories: 2000, targetWeightKg: 65 },
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      token: null,
      isDarkMode: false,
      profile: DEFAULT_PROFILE,
      streak: 0,
      lastLogDate: null,

      setLogin: (status, token = null) => set({ isLoggedIn: status, token }),

      setTheme: (isDark) => set({ isDarkMode: isDark }),

      setProfile: (newProfile) => {
        set((state) => ({
          profile: { ...state.profile, ...newProfile },
        }));
        get().calculateTDEE();
      },

      calculateTDEE: () => {
        const p = get().profile;
        if (!p.weightKg || !p.heightCm || !p.age) return;

        // Mifflin-St Jeor Equation
        let bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
        bmr += p.gender === 'Nam' ? 5 : -161;

        let pal = 1.2;
        if (p.activityLevel === 'Nhẹ') pal = 1.375;
        else if (p.activityLevel === 'Vừa') pal = 1.55;
        else if (p.activityLevel === 'Nặng') pal = 1.725;

        const tdee = Math.round(bmr * pal);

        let targetCal = tdee;
        const targetWeight = p.goals?.targetWeightKg || p.weightKg;

        if (targetWeight < p.weightKg) {
            targetCal -= 500;
        } else if (targetWeight > p.weightKg) {
            targetCal += 300;
        }

        set((state) => ({
            profile: {
                ...state.profile,
                goals: { ...state.profile.goals, dailyCalories: targetCal }
            }
        }));
      },

      // --- LOGIC STREAK (CHUỖI NGÀY) ---
      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại YYYY-MM-DD
        const { lastLogDate, streak } = get();

        // Nếu hôm nay đã log rồi thì không làm gì cả
        if (lastLogDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastLogDate === yesterdayStr) {
            // Nếu lần cuối log là hôm qua -> Tăng streak
            set({ streak: streak + 1, lastLogDate: today });
        } else {
            // Nếu bị ngắt quãng (hoặc lần đầu tiên) -> Reset về 1
            set({ streak: 1, lastLogDate: today });
        }
      },

      logout: () => {
        set({ isLoggedIn: false, token: null, profile: DEFAULT_PROFILE, streak: 0, lastLogDate: null });
        AsyncStorage.removeItem('isLoggedIn');
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        profile: state.profile,
        isDarkMode: state.isDarkMode,
        streak: state.streak,       // Lưu streak xuống máy
        lastLogDate: state.lastLogDate, // Lưu ngày log cuối
      }),
    }
  )
);