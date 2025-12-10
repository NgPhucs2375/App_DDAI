import { Colors } from '@/constants/theme';
import { AIService } from '@/src/services/api'; // Dùng Service thay vì gọi trực tiếp
import { useUserStore } from '@/src/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// ❌ KHÔNG CÒN API KEY Ở ĐÂY NỮA!

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export default function ChatbotScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { profile } = useUserStore(); // Lấy profile từ Store

  useEffect(() => {
    initChat();
  }, []);

  const initChat = () => {
    const userName = profile.fullName || 'bạn';
    const intro = `Chào ${userName}! Mình là trợ lý dinh dưỡng ảo. Mình có thể giúp gì cho bạn?`;
    setMessages([{ id: '0', text: intro, sender: 'ai' }]);
  };

const sendMessage = async () => {
    if (!inputText.trim()) return;

    // 1. UI: Hiển thị tin nhắn người dùng ngay
    const userMsg: Message = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // 2. CHUẨN BỊ DỮ LIỆU
      // Lấy ID người dùng (để Backend biết ai đang hỏi mà tra cứu lịch sử ăn uống)
      const userId = Number(profile.id) || 0;

      // 3. GỌI API (Đã nâng cấp)
      // Không cần gửi context dài dòng nữa, Backend tự lo!
      const res = await AIService.chat(userId, userMsg.text);
      
      // 4. XỬ LÝ PHẢN HỒI TỪ AI
      const aiReply = res?.reply || "Xin lỗi, mình đang mất kết nối.";
      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: aiReply, sender: 'ai' };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg: Message = { id: Date.now().toString(), text: 'Lỗi kết nối Server.', sender: 'ai' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
            <Text style={styles.headerTitle}>Trợ lý Dinh Dưỡng</Text>
            <Text style={styles.headerSub}>Powered by Gemini (Server)</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Chat List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
            {item.sender === 'ai' && <Ionicons name="logo-android" size={16} color={Colors.light.tint} style={{marginBottom:4}}/>}
            <Text style={[styles.text, item.sender === 'user' ? styles.userText : styles.aiText]}>
              {item.text}
            </Text>
          </View>
        )}
      />

      {/* Loading */}
      {isLoading && <Text style={{marginLeft: 20, color: '#888', marginBottom: 10}}>Đang soạn tin...</Text>}

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Hỏi thực đơn, calo..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={isLoading}>
            {isLoading ? <ActivityIndicator size="small" color="#fff"/> : <Ionicons name="send" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  header: { backgroundColor: Colors.light.tint, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, paddingTop: 40, elevation: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign:'center' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10, textAlign: 'center' },
  backBtn: { padding: 5 },
  bubble: { maxWidth: '85%', padding: 12, borderRadius: 16, marginBottom: 10, elevation: 1 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.light.tint, borderBottomRightRadius: 2 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 2 },
  text: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: '#333' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee' },
  input: { flex: 1, backgroundColor: '#f9f9f9', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, fontSize: 16 },
  sendBtn: { backgroundColor: Colors.light.tint, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});