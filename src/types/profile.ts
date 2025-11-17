export type Gender = 'Nam' | 'Nữ' | 'Khác';

export interface UserGoals {
  targetWeightKg?: number;
  targetDate?: string; // ISO date
  dailyCalories?: number;
  proteinTarget?: number; // grams
  fatTarget?: number;
  carbTarget?: number;
}

export interface UserProfile {
  id: string;
  fullName?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  gender?: Gender;
  allergies: string[];
  goals?: UserGoals;
  updatedAt?: string;
  createdAt?: string;
}
