import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppHeader from '../../../components/AppHeader';
import { Colors } from '../../../constants/theme';


// ============ STYLE ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
  },
   text: { fontSize: 22, fontWeight: 'bold', color: Colors.light.text },
});


export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <AppHeader />
      <Text style={styles.text}>Trang cá nhân 👤</Text>
    </View>
  );
}

