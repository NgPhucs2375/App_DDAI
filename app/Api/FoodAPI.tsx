// ...existing named exports...
export type Food = { id: string; name: string; price?: number; image?: string; };

export async function getFoods(): Promise<Food[]> {
  return [
    { id: '1', name: 'Phở', price: 2.5, image: 'https://placeimg.com/64/64/food' },
  ];
}

// KEEP ONLY ONE default export to silence expo-router warning
import React from 'react';
export default function _FoodAPI_Placeholder(): React.ReactElement | null {
  return null;
}