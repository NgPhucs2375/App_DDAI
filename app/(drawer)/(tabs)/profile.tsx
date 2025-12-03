import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/theme';
import { UserService } from '@/src/services/api'; // Import Service
import { useUserStore } from '@/src/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, setProfile } = useUserStore();

  // --- TỰ ĐỘNG TẢI DỮ LIỆU MỚI NHẤT TỪ SERVER ---
  useFocusEffect(
    useCallback(() => {
      const fetchLatestProfile = async () => {
        if (!profile.id) return;
        try {
          const user = await UserService.getProfile(Number(profile.id));
          
          if (user) {
            // XỬ LÝ DỊ ỨNG
            let allergiesArray: string[] = [];
            if (user.allergies) {
                allergiesArray = user.allergies.split(',').map((s: string) => s.trim()).filter((s: string) => s !== "");
            }

            setProfile({
                id: user.id,
                fullName: user.full_name,
                email: user.email, // Thêm email vào store để hiển thị
                age: user.age,
                gender: user.gender,
                heightCm: user.height,
                weightKg: user.weight,
                allergies: allergiesArray,
                goals: {
                    dailyCalories: user.target_calories,
                    targetWeightKg: user.target_weight,
                    targetDate: user.target_date
                }
            });
          }
        } catch (error) {
          console.error("Lỗi tải profile:", error);
        }
      };

      fetchLatestProfile();
    }, [profile.id])
  );

  // --- TÍNH TOÁN BMI & TRẠNG THÁI ---
  const bmiVal = (() => {
    if (!profile?.weightKg || !profile?.heightCm) return null;
    const val = profile.weightKg / Math.pow(profile.heightCm / 100, 2);
    return val.toFixed(1);
  })();

  const getBMIStatus = (bmi: string | null) => {
      if (!bmi) return { label: 'Chưa đủ dữ liệu', color: '#999' };
      const val = parseFloat(bmi);
      if (val < 18.5) return { label: 'Thiếu cân', color: '#3498DB' }; // Xanh dương
      if (val < 24.9) return { label: 'Bình thường', color: '#27AE60' }; // Xanh lá
      if (val < 29.9) return { label: 'Thừa cân', color: '#F39C12' }; // Cam
      return { label: 'Béo phì', color: '#E74C3C' }; // Đỏ
  };
  const bmiStatus = getBMIStatus(bmiVal);

  // --- AVATAR ĐỘNG THEO TÊN ---
  const avatarUrl = `https://ui-avatars.com/api/?name=${profile.fullName || 'User'}&background=random&color=fff&size=128&bold=true`;

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            useUserStore.getState().setLogin(false, null);
            useUserStore.getState().setProfile({}); 
            router.replace('/login');
          }
        }
      ]
    );
  };

  const renderAllergies = () => {
    let list: string[] = [];
    const allergies = profile?.allergies as string | string[] | undefined;

    if (Array.isArray(allergies)) {
        list = allergies;
    } else if (typeof allergies === 'string' && allergies.trim().length > 0) {
        list = allergies.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (list.length === 0) return <Text style={styles.muted}>Không có</Text>;

    return list.map((a, index) => (
        <View key={index} style={styles.chip}>
            <Text style={styles.chipText}>{a}</Text>
        </View>
    ));
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Hồ sơ cá nhân</Text>
        
        {/* THẺ TÊN & AVATAR (Giao diện mới) */}
        <View style={styles.card}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
              <View style={{marginLeft: 15, flex: 1}}>
                  <Text style={styles.name}>{profile?.fullName || 'Người dùng mới'}</Text>
                  <Text style={styles.subText}>{profile?.email}</Text>
                  <Text style={[styles.subText, {marginTop: 4, color: Colors.light.tint, fontWeight: 'bold'}]}>
                    {profile?.age ? `${profile.age} tuổi` : ''} {profile?.gender ? `• ${profile.gender}` : ''}
                  </Text>
              </View>
          </View>
        </View>

        {/* CHỈ SỐ CƠ THỂ & BMI */}
        <View style={styles.row}>
          <Metric label="Cân nặng" value={profile?.weightKg ? profile.weightKg + ' kg' : '--'} />
          <Metric label="Chiều cao" value={profile?.heightCm ? profile.heightCm + ' cm' : '--'} />
          
          {/* Ô BMI có màu sắc */}
          <View style={styles.metric}>
              <Text style={styles.metricLabel}>BMI</Text>
              <Text style={[styles.metricValue, {color: bmiStatus.color}]}>{bmiVal || '--'}</Text>
              <Text style={{fontSize: 10, color: bmiStatus.color, fontWeight: 'bold', marginTop: 2}}>
                  {bmiStatus.label}
              </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.cta} onPress={() => router.push('/profile/edit' as Href)}>
          <Text style={styles.ctaText}>Cập nhật chỉ số cơ thể</Text>
        </TouchableOpacity>

        {/* MỤC TIÊU */}
        <Section title="Mục tiêu của bạn">
          <View style={styles.goalRow}>
             <View>
                 <Text style={styles.goalLabel}>Cân nặng mục tiêu</Text>
                 <Text style={styles.goalValue}>{profile?.goals?.targetWeightKg ? `${profile.goals.targetWeightKg} kg` : 'Chưa đặt'}</Text>
             </View>
             <View>
                 <Text style={styles.goalLabel}>Calo hằng ngày</Text>
                 <Text style={styles.goalValue}>{profile?.goals?.dailyCalories ? `${profile.goals.dailyCalories} kcal` : 'Chưa đặt'}</Text>
             </View>
          </View>
          {profile?.goals?.targetDate && <Text style={styles.goalDate}>Hạn chót: {profile.goals.targetDate}</Text>}
          
          <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/profile/goals' as Href)}>
            <Text style={styles.linkText}>Thay đổi mục tiêu</Text>
          </TouchableOpacity>
        </Section>

        {/* DỊ ỨNG */}
        <Section title="Dị ứng thực phẩm">
          <View style={styles.chipWrap}>
            {renderAllergies()}
          </View>
          <TouchableOpacity style={styles.linkBtn} onPress={() => router.push('/profile/allergies' as Href)}>
            <Text style={styles.linkText}>Cập nhật dị ứng</Text>
          </TouchableOpacity>
        </Section>

        {/* TÀI KHOẢN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt tài khoản</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/change-password' as Href)}>
            <View style={styles.menuRow}>
              <Ionicons name="lock-closed-outline" size={22} color={Colors.light.icon} />
              <Text style={styles.menuText}>Đổi mật khẩu</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuRow}>
              <Ionicons name="log-out-outline" size={22} color="#D32F2F" />
              <Text style={[styles.menuText, { color: '#D32F2F', fontWeight: '600' }]}>Đăng xuất</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { padding: 16, paddingBottom: 60 },
  heading: { fontSize: 24, fontWeight: '800', marginBottom: 16, color: '#1C1C1E', marginLeft: 4 },
  
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2, shadowColor:'#000', shadowOpacity:0.05 },
  avatarImg: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#eee' }, // Style cho avatar
  name: { fontSize: 20, fontWeight: '700', color: '#000' },
  subText: { fontSize: 14, color: '#666' },

  row: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metric: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 10, paddingVertical: 15, alignItems: 'center', elevation: 1 },
  metricLabel: { fontSize: 12, color: '#888', marginBottom: 6, textTransform:'uppercase' },
  metricValue: { fontSize: 18, fontWeight: '700', color: '#333' },
  
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 1 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 15, color: '#333' },
  
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  goalLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  goalValue: { fontSize: 18, fontWeight: '700', color: Colors.light.tint },
  goalDate: { fontSize: 13, color: '#888', fontStyle: 'italic', marginBottom: 10 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 5 },
  chip: { backgroundColor: '#F0F0F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 14, color: '#333' },
  muted: { color: '#999', fontStyle: 'italic' },

  linkBtn: { marginTop: 10, paddingVertical: 5 },
  linkText: { color: Colors.light.tint, fontSize: 15, fontWeight: '600' },
  
  cta: { backgroundColor: Colors.light.tint, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 20, elevation: 3 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuText: { fontSize: 16, color: '#333' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 4 },
});