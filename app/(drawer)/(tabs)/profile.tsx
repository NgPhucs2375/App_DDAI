import { router, type Href } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  content: { padding: 16, paddingBottom: 40 },
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
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: Colors.light.text },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { backgroundColor: Colors.light.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  chipText: { fontSize: 12, color: Colors.light.text },
  linkBtn: { marginTop: 8 },
  linkText: { color: Colors.light.tint, fontSize: 14 },
  cta: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  muted: { color: Colors.light.icon, fontSize: 14 },
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

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Hồ sơ</Text>
        <View style={styles.card}>
          <Text style={styles.name}>{profile?.fullName || 'Chưa có tên'}</Text>
          <Text style={styles.sub}>
            {profile?.age ? `${profile.age} tuổi • ` : ''}{profile?.gender || '—'}
          </Text>
        </View>
        <View style={styles.row}>
          <Metric label="Cân nặng" value={profile?.weightKg ? profile.weightKg + ' kg' : '—'} />
          <Metric label="Chiều cao" value={profile?.heightCm ? profile.heightCm + ' cm' : '—'} />
          <Metric label="BMI" value={bmi || '—'} />
        </View>
        <Section title="Mục tiêu">
          {profile?.goals?.targetWeightKg ? (
            <Text>Đạt {profile.goals.targetWeightKg} kg trước {profile.goals.targetDate || '—'}</Text>
          ) : (
            <Text style={styles.muted}>Chưa đặt mục tiêu</Text>
          )}
          <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/profile/goals' as Href)}>
            <Text style={styles.linkText}>Quản lý mục tiêu</Text>
          </TouchableOpacity>
        </Section>
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
          <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/profile/allergies' as Href)}>
            <Text style={styles.linkText}>Quản lý dị ứng</Text>
          </TouchableOpacity>
        </Section>
  <TouchableOpacity style={styles.cta} onPress={() => router.push('/profile/edit' as Href)}>
          <Text style={styles.ctaText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>
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

