import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function Layout_Tabs() {
  return (
    <Tabs 
screenOptions={{
      headerStyle:{backgroundColor:'#1abc9c'},
      headerTintColor:'white',
      tabBarActiveTintColor:'#e67e22',
      tabBarInactiveTintColor:'gray',
      tabBarStyle:{backgroundColor:'#ecf0f1'},
}}
    >
      <Tabs.Screen
      name="index"
      options={{
        title:'Trang chủ',  
        tabBarIcon: ({color, size}) => (
          <Ionicons name ="home" size={size} color={color}/>
        ),
      }}
      />

      <Tabs.Screen
       name="details" 
       options={{
        title:"Thông tin chi tiết",
        tabBarIcon: ({color, size}) => (
          <Ionicons name ="document-text" size={size} color={color}/>
        ),
      }}/>

       <Tabs.Screen
       name="explore" 
       options={{
        title:"Khám phá",
        tabBarIcon: ({color, size}) => (
          <Ionicons name ="compass" size={size} color={color}/>
        ),
      }}/>

       <Tabs.Screen
       name="profile" 
       options={{
        title:"Thông tin chi tiết",
        tabBarIcon: ({color, size}) => (
          <Ionicons name ="person" size={size} color={color}/>
        ),
      }}/>

    </Tabs>
  );
}