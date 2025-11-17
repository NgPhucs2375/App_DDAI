import { Redirect } from 'expo-router';
import React from 'react';

// Redirect Drawer "Lịch sử bữa ăn" to the Tab "MealHistory"
export default function MealHistoryDrawerRedirect() {
  return <Redirect href="/(drawer)/(tabs)/MealHistory" />;
}
