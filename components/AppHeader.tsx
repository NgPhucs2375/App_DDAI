import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useNavigation } from 'expo-router';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/theme';

type AppHeaderProps = {
  rightIconName?: React.ComponentProps<typeof Ionicons>['name'];
  onRightPress?: () => void;
};

export function AppHeader({ rightIconName = 'notifications-outline', onRightPress }: AppHeaderProps) {
  const navigation = useNavigation();
  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={openDrawer} accessibilityRole="button" accessibilityLabel="Open drawer">
        <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.avatar} />
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Tìm kiếm..."
          placeholderTextColor="#555"
          style={styles.searchInput}
        />
      </View>

      <TouchableOpacity onPress={onRightPress} accessibilityRole="button">
        <Ionicons name={rightIconName} size={26} color={Colors.light.icon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.light.headerBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: Colors.light.icon,
    borderWidth: 2,
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    fontSize: 16,
    color: Colors.light.text,
  },
});

export default AppHeader;
