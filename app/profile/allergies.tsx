import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../constants/theme';
import { loadProfile, saveProfile } from '../../src/data/profileStore';
import { UserProfile } from '../../src/types/profile';

export default function AllergiesScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    loadProfile().then(p => setProfile(p || { id: 'local-user', allergies: [] }));
  }, []);

  const addAllergy = () => {
    const v = input.trim();
    if (!v) return;
    if (profile) {
      const next = { ...profile, allergies: Array.from(new Set([...(profile.allergies || []), v])) };
      setProfile(next);
      setInput('');
    }
  };

  const removeAllergy = (a: string) => {
    if (profile) {
      const next = { ...profile, allergies: (profile.allergies || []).filter(x => x !== a) };
      setProfile(next);
    }
  };

  const persist = async () => {
    if (!profile) return;
    await saveProfile(profile);
    Alert.alert('Đã lưu dị ứng');
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Dị ứng</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={input}
            onChangeText={setInput}
            placeholder="Thêm dị ứng (vd: tôm, đậu phộng)"
          />
          <TouchableOpacity style={styles.addBtn} onPress={addAllergy}>
            <Text style={styles.addText}>+ Thêm</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chipWrap}>
          {(profile?.allergies || []).map(a => (
            <TouchableOpacity key={a} style={styles.chip} onPress={() => removeAllergy(a)}>
              <Text style={styles.chipText}>{a}  ×</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={persist}>
          <Text style={styles.saveText}>Lưu</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 16, color: Colors.light.text },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.light.text,
  },
  addBtn: { backgroundColor: Colors.light.tint, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  addText: { color: '#fff', fontWeight: '600' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  chip: { backgroundColor: Colors.light.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  chipText: { fontSize: 12, color: Colors.light.text },
  saveBtn: { marginTop: 16, backgroundColor: Colors.light.tint, paddingVertical: 14, borderRadius: 30, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
