import { ReactNode } from "react";

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
  email: ReactNode;
  id: string;
  fullName?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  gender?: Gender;
  activityLevel?: string;
  allergies: string[];
  goals?: UserGoals;
  isAdmin?: boolean;
  updatedAt?: string;
  createdAt?: string;
}
