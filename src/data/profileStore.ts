import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types/profile';

const KEY = 'user_profile';

export async function loadProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveProfile(p: UserProfile) {
  await AsyncStorage.setItem(KEY, JSON.stringify({ ...p, updatedAt: new Date().toISOString() }));
}
