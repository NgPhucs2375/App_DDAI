import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from '../../../components/AppHeader';

// Mock Data cho bài viết cộng đồng
const POSTS = [
  {
    id: '1',
    user: 'Nguyễn Văn A',
    avatar: 'https://i.pravatar.cc/150?u=a',
    image: 'https://picsum.photos/500/300?random=1',
    content: 'Bữa sáng healthy với yến mạch và chuối! 🍌🥣 #healthy #breakfast',
    likes: 12,
    comments: 4,
    isLiked: false,
  },
  {
    id: '2',
    user: 'Trần Thị B',
    avatar: 'https://i.pravatar.cc/150?u=b',
    image: 'https://picsum.photos/500/300?random=2',
    content: 'Đã hoàn thành mục tiêu giảm 2kg tháng này! Cố lên mọi người 💪',
    likes: 45,
    comments: 10,
    isLiked: true,
  },
];

export default function CommunityScreen() {
  const [data, setData] = useState(POSTS);

  // Xử lý Thả tim (UC24)
  const toggleLike = (id: string) => {
    setData(prev => prev.map(post => 
      post.id === id 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const renderPost = ({ item }: { item: typeof POSTS[0] }) => (
    <View style={styles.card}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View>
            <Text style={styles.userName}>{item.user}</Text>
            <Text style={styles.time}>2 giờ trước</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Post Image & Content */}
      <Text style={styles.postContent}>{item.content}</Text>
      <Image source={{ uri: item.image }} style={styles.postImage} />

      {/* Action Buttons (UC23, UC24) */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(item.id)}>
            <Ionicons name={item.isLiked ? "heart" : "heart-outline"} size={24} color={item.isLiked ? "#E91E63" : "#333"} />
            <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={22} color="#333" />
            <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-social-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader />
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
            <Text style={styles.pageTitle}>Cộng đồng 🌍</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  list: { paddingBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', padding: 16, paddingBottom: 0 },
  
  card: { backgroundColor: '#fff', marginTop: 16, padding: 15, borderRadius: 0, elevation: 1 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  userName: { fontWeight: 'bold', fontSize: 15 },
  time: { color: '#888', fontSize: 12 },
  moreBtn: { marginLeft: 'auto' },
  
  postContent: { marginBottom: 10, fontSize: 15, lineHeight: 22 },
  postImage: { width: '100%', height: 250, borderRadius: 10, backgroundColor: '#eee' },
  
  actions: { flexDirection: 'row', marginTop: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 25 },
  actionText: { marginLeft: 6, fontWeight: '500', color: '#555' },
});