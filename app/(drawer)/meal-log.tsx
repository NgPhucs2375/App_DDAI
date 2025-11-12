import { Redirect } from 'expo-router';
import React from 'react';

// Redirect Drawer "Nhật ký bữa ăn" to the Tab "MealLog"
export default function MealLogDrawerRedirect() {
  return <Redirect href="/(drawer)/(tabs)/MealLog" />;
}
