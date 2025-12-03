import sqlite3
import datetime

DB_NAME = "QL DỮ LIỆU.sql"

def seed_community_posts():
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        print("🔧 Đang kiểm tra bảng Posts...")

        # 1. TỰ TẠO BẢNG NẾU CHƯA CÓ (Fix lỗi "no such table")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT,
            avatar TEXT,
            content TEXT,
            image_url TEXT,
            likes INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );
        """)

        # 2. XÓA DỮ LIỆU CŨ (Để tránh bị trùng lặp nhiều lần)
        cursor.execute("DELETE FROM posts")

        # 3. DANH SÁCH BÀI VIẾT MẪU
        posts = [
            ("Admin", "https://i.pravatar.cc/150?u=admin", "Chào mừng các bạn đến với cộng đồng Eat Clean! 🥗 Chia sẻ bữa ăn của bạn ngay nhé.", "https://picsum.photos/500/300?random=1", 999),
            ("Thảo Nhi", "https://i.pravatar.cc/150?u=nhi", "Hôm nay mình làm món salad ức gà, ngon tuyệt! 😋 Mọi người chấm điểm giúp mình nha.", "https://picsum.photos/500/300?random=2", 25),
            ("Minh Tuấn", "https://i.pravatar.cc/150?u=tuan", "Mục tiêu giảm 5kg trong tháng này. Ngày đầu tiên: 1800 calo. Cố lên! 💪", "https://picsum.photos/500/300?random=3", 14),
            ("Lan Anh", "https://i.pravatar.cc/150?u=lan", "Có ai biết chỗ mua yến mạch nguyên hạt giá tốt không ạ? Chỉ mình với!", "", 5),
            ("Hoàng Nam", "https://i.pravatar.cc/150?u=nam", "Cheat day: Làm ngay 1 ly trà sữa full topping 🤣 Mai tập bù.", "https://picsum.photos/500/300?random=4", 42),
        ]

        print("🌱 Đang thêm bài viết mẫu...")
        cursor.executemany("""
            INSERT INTO posts (user_name, avatar, content, image_url, likes)
            VALUES (?, ?, ?, ?, ?)
        """, posts)

        conn.commit()
        conn.close()
        print("🎉 THÀNH CÔNG! Đã thêm 5 bài viết vào Database.")

    except Exception as e:
        print(f"❌ Vẫn lỗi: {e}")

if __name__ == "__main__":
    seed_community_posts()