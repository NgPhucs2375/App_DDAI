import { Redirect } from 'expo-router';
import React from 'react';

// Redirect Drawer "Hồ sơ" to the Tab "profile"
export default function ProfileDrawerRedirect() {
  return <Redirect href="/(drawer)/(tabs)/profile" />;
}


