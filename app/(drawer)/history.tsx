import { Redirect } from 'expo-router';
import React from 'react';

// Khi bấm vào menu "Lịch sử", chuyển hướng sang Tab Lịch sử
export default function HistoryRedirect() {
  return <Redirect href="/(drawer)/(tabs)/MealHistory" />;
}