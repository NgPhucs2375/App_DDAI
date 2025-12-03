import AppHeader from '@/components/AppHeader';
import { Colors } from '@/constants/theme';
import { CommunityService } from '@/src/services/api';
import { useUserStore } from '@/src/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CommunityScreen() {
  const { profile } = useUserStore(); // Lấy thông tin user đang đăng nhập
  const [data, setData] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newContent, setNewContent] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const loadPosts = async () => {
    const posts = await CommunityService.getPosts();
    if (Array.isArray(posts)) setData(posts);
  };

  const handleLike = async (id: number) => {
    setData(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    await CommunityService.likePost(id.toString());
  };

  const handleCreatePost = async () => {
    if (!newContent.trim()) {
        Alert.alert('Lỗi', 'Bạn chưa nhập nội dung!');
        return;
    }

    const userName = profile.fullName || 'Người dùng ẩn danh';
    const res = await CommunityService.createPost(userName, newContent);

    if (res && res.message) {
        Alert.alert('Thành công', 'Đã đăng bài viết!');
        setNewContent('');
        setModalVisible(false);
        loadPosts(); // Tải lại danh sách
    } else {
        Alert.alert('Lỗi', 'Không thể đăng bài');
    }
  };

  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
        <View>
            <Text style={styles.userName}>{item.user_name}</Text> 
            <Text style={styles.time}>{item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : 'Vừa xong'}</Text>
        </View>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.postImage} resizeMode="cover" /> : null}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item.id)}>
            <Ionicons name="heart-outline" size={24} color="#333" />
            <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}><Ionicons name="chatbubble-outline" size={22} color="#333" /><Text style={styles.actionText}>Bình luận</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader />
      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListHeaderComponent={<Text style={styles.pageTitle}>Cộng đồng 🌍</Text>}
      />

      {/* NÚT ĐĂNG BÀI (FAB) */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="pencil" size={24} color="#fff" />
      </TouchableOpacity>

      {/* MODAL NHẬP BÀI VIẾT */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Tạo bài viết mới</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="Bạn đang nghĩ gì?" 
                    multiline 
                    value={newContent}
                    onChangeText={setNewContent}
                />
                <View style={styles.modalBtns}>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btnCancel}>
                        <Text style={{color:'#666', fontWeight:'bold'}}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCreatePost} style={styles.btnPost}>
                        <Text style={{color:'#fff', fontWeight:'bold'}}>Đăng ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  list: { paddingBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', padding: 16, paddingBottom: 0, color: '#333' },
  card: { backgroundColor: '#fff', marginTop: 10, padding: 15, marginBottom: 5 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: '#eee' },
  userName: { fontWeight: 'bold', fontSize: 15, color: '#000' },
  time: { color: '#888', fontSize: 12 },
  postContent: { marginBottom: 10, fontSize: 15, lineHeight: 22, color: '#333' },
  postImage: { width: '100%', height: 250, borderRadius: 10, backgroundColor: '#eee', marginTop: 5 },
  actions: { flexDirection: 'row', marginTop: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 25 },
  actionText: { marginLeft: 6, fontWeight: '500', color: '#555' },
  
  // Style cho FAB và Modal
  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.light.tint, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 15, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, height: 100, textAlignVertical: 'top', fontSize: 16 },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 15 },
  btnCancel: { padding: 10 },
  btnPost: { backgroundColor: Colors.light.tint, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 }
});