import { Ionicons } from '@expo/vector-icons'; // Mới thêm: Icon
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, type Href } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Mới thêm: Alert
import AppHeader from '../../../components/AppHeader';
import { Colors } from '../../../constants/theme';
import { loadProfile } from '../../../src/data/profileStore';
import { UserProfile } from '../../../src/types/profile';

// ============ STYLE ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: { padding: 16, paddingBottom: 60 }, // Tăng padding bottom để không bị che
  heading: { fontSize: 22, fontWeight: '600', marginBottom: 16, color: Colors.light.text },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
  },
  name: { fontSize: 20, fontWeight: '600', color: Colors.light.text },
  sub: { marginTop: 4, color: Colors.light.icon },
  row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  metric: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  metricLabel: { fontSize: 12, color: Colors.light.icon, marginBottom: 4 },
  metricValue: { fontSize: 16, fontWeight: '600', color: Colors.light.text },
  section: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: Colors.light.text }, // Tăng margin bottom
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { backgroundColor: Colors.light.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  chipText: { fontSize: 12, color: Colors.light.text },
  linkBtn: { marginTop: 12 },
  linkText: { color: Colors.light.tint, fontSize: 14, fontWeight: '500' },
  cta: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  ctaText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  muted: { color: Colors.light.icon, fontSize: 14 },
  
  // Style mới cho menu item (Đổi mật khẩu / Đăng xuất)
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuText: { fontSize: 16, color: Colors.light.text },
  divider: { height: 1, backgroundColor: Colors.light.border, marginVertical: 4 },
});

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile().then(p => setProfile(p));
  }, []);

  const bmi = (() => {
    if (!profile?.weightKg || !profile?.heightCm) return null;
    const val = profile.weightKg / Math.pow(profile.heightCm / 100, 2);
    return val.toFixed(1);
  })();

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            // 1. Xóa trạng thái đăng nhập
            await AsyncStorage.removeItem('isLoggedIn');
            // 2. Điều hướng về màn hình Login
            router.replace('/login');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Hồ sơ</Text>
        
        {/* CARD THÔNG TIN CÁ NHÂN */}
        <View style={styles.card}>
          <Text style={styles.name}>{profile?.fullName || 'Chưa có tên'}</Text>
          <Text style={styles.sub}>
            {profile?.age ? `${profile.age} tuổi • ` : ''}{profile?.gender || '—'}
          </Text>
        </View>

        {/* METRICS (Cân nặng, Chiều cao, BMI) */}
        <View style={styles.row}>
          <Metric label="Cân nặng" value={profile?.weightKg ? profile.weightKg + ' kg' : '—'} />
          <Metric label="Chiều cao" value={profile?.heightCm ? profile.heightCm + ' cm' : '—'} />
          <Metric label="BMI" value={bmi || '—'} />
        </View>

        {/* NÚT CHỈNH SỬA HỒ SƠ */}
        <TouchableOpacity style={styles.cta} onPress={() => router.push('/edit' as Href)}>
          <Text style={styles.ctaText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>

        {/* MỤC TIÊU */}
        <Section title="Mục tiêu">
          {profile?.goals?.targetWeightKg ? (
            <Text>Đạt {profile.goals.targetWeightKg} kg trước {profile.goals.targetDate || '—'}</Text>
          ) : (
            <Text style={styles.muted}>Chưa đặt mục tiêu</Text>
          )}
          <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/goals' as Href)}>
            <Text style={styles.linkText}>Quản lý mục tiêu</Text>
          </TouchableOpacity>
        </Section>

        {/* DỊ ỨNG */}
        <Section title="Dị ứng">
          <View style={styles.chipWrap}>
            {profile?.allergies?.length ? (
              profile.allergies.slice(0, 4).map(a => (
                <View key={a} style={styles.chip}><Text style={styles.chipText}>{a}</Text></View>
              ))
            ) : (
              <Text style={styles.muted}>Không có</Text>
            )}
          </View>
          <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/allergies' as Href)}>
            <Text style={styles.linkText}>Quản lý dị ứng</Text>
          </TouchableOpacity>
        </Section>

        {/* ======================================================== */}
        {/* MỚI: SECTION TÀI KHOẢN (ĐỔI MẬT KHẨU & ĐĂNG XUẤT) */}
        {/* ======================================================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>

          {/* Nút Đổi mật khẩu */}
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push('/change-password')}
          >
            <View style={styles.menuRow}>
              <Ionicons name="key-outline" size={22} color={Colors.light.icon} />
              <Text style={styles.menuText}>Đổi mật khẩu</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.icon} />
          </TouchableOpacity>

          <View style={styles.divider} />
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push('/settings')}
          >
            <View style={styles.menuRow}>
              <Ionicons name="settings-outline" size={22} color={Colors.light.icon} />
              <Text style={styles.menuText}>Cài đặt ứng dụng</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.icon} />
          </TouchableOpacity>
          {/* Nút Đăng xuất */}
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleLogout}
          >
            <View style={styles.menuRow}>
              <Ionicons name="log-out-outline" size={22} color="#D32F2F" />
              <Text style={[styles.menuText, { color: '#D32F2F', fontWeight: '500' }]}>Đăng xuất</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}