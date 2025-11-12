import { Redirect } from 'expo-router';
import React from 'react';

// Redirect Drawer "Công thức" to the Tab "Recipes"
export default function RecipesDrawerRedirect() {
  return <Redirect href="/(drawer)/(tabs)/Recipes" />;
}
