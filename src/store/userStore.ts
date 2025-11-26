import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { UserProfile } from '../types/profile';

interface UserState {
  isLoggedIn: boolean;
  token: string | null;
  isDarkMode: boolean;
  profile: UserProfile;
  setLogin: (status: boolean, token?: string | null) => void;
  setProfile: (newProfile: Partial<UserProfile>) => void;
  setTheme: (isDark: boolean) => void;
  calculateTDEE: () => void; // Hàm mới
  clearStore: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'guest',
  fullName: 'Người dùng mới',
  age: 25,
  gender: 'Nam',
  heightCm: 170,
  weightKg: 65,
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

      setLogin: (status: boolean, token: string | null = null) => set({ isLoggedIn: status, token }),

      setTheme: (isDark) => set({ isDarkMode: isDark }),

      setProfile: (newProfile) => {
        set((state) => ({
          profile: { ...state.profile, ...newProfile },
        }));
        // Tự động tính lại TDEE mỗi khi cập nhật profile
        get().calculateTDEE();
      },

      // LOGIC KHOA HỌC: Công thức Mifflin-St Jeor
      calculateTDEE: () => {
        const p = get().profile;
        if (!p.weightKg || !p.heightCm || !p.age) return;

        // 1. Tính BMR (Basal Metabolic Rate)
        let bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
        bmr += p.gender === 'Nam' ? 5 : -161;

        // 2. Tính TDEE (Giả sử vận động nhẹ x1.375)
        const tdee = Math.round(bmr * 1.375);

        // 3. Điều chỉnh theo mục tiêu (Giảm cân thì trừ 500kcal)
        let targetCal = tdee;
        if (p.goals?.targetWeightKg && p.goals.targetWeightKg < p.weightKg) {
            targetCal -= 500; // Thâm hụt calo để giảm cân
        } else if (p.goals?.targetWeightKg && p.goals.targetWeightKg > p.weightKg) {
            targetCal += 500; // Dư thừa calo để tăng cân
        }

        // Cập nhật lại Goal trong Store
        set((state) => ({
            profile: {
                ...state.profile,
                goals: { ...state.profile.goals, dailyCalories: targetCal }
            }
        }));
      },

      clearStore: () => set({ isLoggedIn: false, token: null, profile: DEFAULT_PROFILE }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        profile: state.profile,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);