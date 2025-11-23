import { Colors } from '@/constants/theme';
import { loadProfile } from '@/src/data/profileStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export default function ChatbotScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('bạn');

  useEffect(() => {
    // Cá nhân hóa: Lấy tên người dùng để chào
    loadProfile().then(p => {
      if (p?.fullName) setUserName(p.fullName);
      setMessages([
        { 
          id: '0', 
          text: `Chào ${p?.fullName || 'bạn'}! Tôi là trợ lý dinh dưỡng AI. Tôi có thể giúp gì cho thực đơn hôm nay?`, 
          sender: 'ai' 
        }
      ]);
    });
  }, []);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Giả lập AI trả lời (Trong thực tế bạn gọi API Gemini/OpenAI ở đây)
    setTimeout(() => {
      let aiResponse = "Tôi chưa hiểu ý bạn lắm, hãy thử hỏi về calo hoặc thực đơn.";
      const lower = userMsg.text.toLowerCase();

      if (lower.includes('giảm cân')) aiResponse = "Để giảm cân, bạn nên ưu tiên ức gà, rau xanh và hạn chế tinh bột vào buổi tối.";
      if (lower.includes('calo') || lower.includes('bao nhiêu')) aiResponse = "Một bát phở bò trung bình chứa khoảng 450-500 kcal.";
      if (lower.includes('thực đơn') || lower.includes('gợi ý')) aiResponse = `Với mục tiêu của ${userName}, tôi gợi ý bữa trưa nên ăn Salad cá ngừ và 1 quả táo.`;

      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: aiResponse, sender: 'ai' };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trợ lý AI 🤖</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Chat List */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.text, item.sender === 'user' ? styles.userText : styles.aiText]}>
              {item.text}
            </Text>
          </View>
        )}
      />

      {/* Input Area */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Hỏi AI về dinh dưỡng..."
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: Colors.light.tint, flexDirection: 'row', alignItems: 'center', 
    justifyContent: 'space-between', padding: 16, paddingTop: Platform.OS === 'android' ? 40 : 10
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 12, marginBottom: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.light.tint, borderBottomRightRadius: 2 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 2 },
  text: { fontSize: 16 },
  userText: { color: '#fff' },
  aiText: { color: '#333' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
  sendBtn: { backgroundColor: Colors.light.tint, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});