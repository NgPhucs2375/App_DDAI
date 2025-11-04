import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import axios from "axios";

type User = {
  id: number;
  name: string;
  email: string;
};

export default function FoodAPI() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<User[]>("https://jsonplaceholder.typicode.com/users");
      setUsers(response.data);
    } catch (err) {
      setError("Lỗi khi lấy dữ liệu.");
      console.error("Lỗi khi kéo API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
          <Text style={{ color: "#fff" }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách người dùng</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  item: { padding: 10, borderBottomWidth: 1, borderColor: "#ddd" },
  name: { fontSize: 16, fontWeight: "bold" },
  email: { fontSize: 14, color: "gray" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  retryButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
});
