import AsyncStorage from '@react-native-async-storage/async-storage';

const MEAL_KEY = 'user_meals_data';

export type Meal = {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: string;
  calories?: number;
  createdAt: string; // ISO String
};

// Tải danh sách món ăn
export const loadMeals = async (): Promise<Meal[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(MEAL_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    return [];
  }
};

// Thêm món ăn mới
export const addMeal = async (newMeal: Meal) => {
  try {
    const currentMeals = await loadMeals();
    const updatedMeals = [newMeal, ...currentMeals]; // Thêm vào đầu danh sách
    await AsyncStorage.setItem(MEAL_KEY, JSON.stringify(updatedMeals));
  } catch (e) {
    console.error('Lỗi lưu món ăn', e);
  }
};

// Xóa món ăn
export const removeMeal = async (id: string) => {
  try {
    const currentMeals = await loadMeals();
    const updatedMeals = currentMeals.filter(m => m.id !== id);
    await AsyncStorage.setItem(MEAL_KEY, JSON.stringify(updatedMeals));
    return updatedMeals;
  } catch (e) {
    console.error('Lỗi xóa món ăn', e);
    return [];
  }
};