import { Colors } from '@/constants/theme';
import { loadProfile } from '@/src/data/profileStore';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Import Gemini
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

// ⚠️ THAY KEY CỦA BẠN VÀO ĐÂY
const GEMINI_API_KEY = 'AIzaSyBcEENzqehBToUl2_odBv8-rJC5MewsSWQ'; 

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

  // Khởi tạo Gemini
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  useEffect(() => {
    initChat();
  }, []);

  const initChat = async () => {
    const p = await loadProfile();
    const userName = p?.fullName || 'bạn';
    // Prompt ngữ cảnh ban đầu (System Instruction)
    const intro = `Chào ${userName}! Tôi là AI Dinh Dưỡng. Dựa trên hồ sơ của bạn (Cao: ${p?.heightCm}cm, Nặng: ${p?.weightKg}kg), tôi có thể giúp tính TDEE, gợi ý thực đơn giảm cân/tăng cơ hoặc giải đáp thắc mắc về calo. Bạn cần giúp gì?`;
    
    setMessages([{ id: '0', text: intro, sender: 'ai' }]);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // 1. Lấy Context Profile để AI thông minh hơn
      const profile = await loadProfile();
      const context = `
        Bạn là chuyên gia dinh dưỡng.
        Thông tin người dùng:
        - Tên: ${profile?.fullName}
        - Cân nặng: ${profile?.weightKg}kg
        - Chiều cao: ${profile?.heightCm}cm
        - Mục tiêu: ${profile?.goals?.dailyCalories} kcal/ngày.
        - Dị ứng: ${profile?.allergies?.join(', ') || 'Không'}.
        
        Hãy trả lời ngắn gọn, thân thiện, tập trung vào dinh dưỡng và sức khỏe.
        Câu hỏi của người dùng: "${userMsg.text}"
      `;

      // 2. Gọi Gemini API
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(context);
      const response = result.response;
      const text = response.text();

      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: text, sender: 'ai' };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.', sender: 'ai' }]);
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
            <Text style={styles.headerTitle}>Trợ lý Dinh Dưỡng AI</Text>
            <Text style={styles.headerSub}>Powered by Gemini</Text>
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
            {item.sender === 'ai' && <Ionicons name="logo-android" size={16} color={Colors.light.tint} style={{marginBottom: 4}} />}
            <Text style={[styles.text, item.sender === 'user' ? styles.userText : styles.aiText]}>
              {item.text}
            </Text>
          </View>
        )}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={{ marginLeft: 20, marginBottom: 10 }}>
            <Text style={{color: '#888', fontSize: 12}}>AI đang nhập...</Text>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Hỏi thực đơn, calo, lời khuyên..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" size="small"/> : <Ionicons name="send" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  header: {
    backgroundColor: Colors.light.tint, flexDirection: 'row', alignItems: 'center', 
    justifyContent: 'space-between', padding: 15, paddingTop: Platform.OS === 'android' ? 40 : 15,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1
  },
  backBtn: { padding: 5 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign:'center' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10, textAlign: 'center' },
  
  bubble: { maxWidth: '85%', padding: 14, borderRadius: 16, marginBottom: 12, elevation: 1 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.light.tint, borderBottomRightRadius: 2 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 2 },
  
  text: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: '#333' },
  
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee' },
  input: { flex: 1, backgroundColor: '#f9f9f9', borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12, marginRight: 10, fontSize: 15, borderWidth: 1, borderColor: '#eee' },
  sendBtn: { backgroundColor: Colors.light.tint, width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', elevation: 2 },
});