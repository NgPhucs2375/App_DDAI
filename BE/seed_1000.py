import sqlite3
import random

DB_NAME = "dulieu.db"

def seed_massive_data():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    print("🚀 Đang khởi động máy máy tạo dữ liệu siêu tốc...")

    # 1. DANH SÁCH NGUYÊN LIỆU GỐC (Base Foods)
    # (Tên, Calo/100g, Pro, Carb, Fat, Fiber, Vitamin, Loại)
    nguyen_lieu = [
        ("Thịt gà", 165, 31, 0, 3.6, 0, "B3", "L001"),
        ("Thịt bò", 250, 26, 0, 15, 0, "B12", "L001"),
        ("Thịt heo", 242, 27, 0, 14, 0, "B1", "L001"),
        ("Cá hồi", 208, 20, 0, 13, 0, "Omega-3", "L004"),
        ("Cá thu", 205, 19, 0, 14, 0, "D", "L004"),
        ("Cá lóc", 97, 18, 0, 2, 0, "A", "L004"),
        ("Tôm", 99, 24, 0.2, 0.3, 0, "B12", "L004"),
        ("Mực", 92, 16, 3, 1.4, 0, "B12", "L004"),
        ("Đậu hũ", 76, 8, 2, 4, 0.3, "K", "L008"),
        ("Sườn non", 300, 15, 0, 25, 0, "B1", "L001"),
        ("Ba chỉ", 518, 9, 0, 53, 0, "B1", "L001"),
        ("Ức vịt", 130, 20, 0, 5, 0, "B3", "L021"),
        ("Khoai tây", 77, 2, 17, 0.1, 2.2, "C", "L005"),
        ("Khoai lang", 86, 1.6, 20, 0.1, 3, "A", "L005"),
        ("Cà tím", 25, 1, 6, 0.2, 3, "C", "L002"),
        ("Bông cải", 34, 2.8, 7, 0.4, 2.6, "C", "L002"),
        ("Nấm", 22, 3, 3, 0.3, 1, "D", "L010"),
        ("Trứng", 155, 13, 1.1, 11, 0, "A,D", "L006"),
    ]

    # 2. CÁC KIỂU CHẾ BIẾN (Modifiers)
    # (Tên hậu tố, Hệ số Calo, Hệ số Fat, Cộng thêm Fat, Cộng thêm Carb)
    che_bien = [
        ("luộc", 1.0, 1.0, 0, 0),
        ("hấp", 1.0, 1.0, 0, 0),
        ("nướng mọi", 1.1, 0.9, 0, 0), # Nướng chảy bớt mỡ
        ("nướng BBQ", 1.4, 1.1, 2, 5), # Thêm sốt
        ("chiên giòn", 1.8, 2.5, 12, 10), # Thêm dầu và bột
        ("chiên nước mắm", 1.9, 2.5, 12, 8),
        ("xào tỏi", 1.3, 1.5, 5, 1),
        ("xào sả ớt", 1.3, 1.5, 5, 2),
        ("kho gừng", 1.2, 1.1, 1, 3),
        ("kho tiêu", 1.2, 1.1, 1, 2),
        ("sốt cà chua", 1.3, 1.2, 3, 6),
        ("nấu canh", 0.8, 0.9, 1, 2), # Canh thì calo/100g giảm do nhiều nước
        ("làm gỏi", 1.1, 1.0, 1, 4),
        ("rang muối", 1.5, 1.2, 4, 1),
        ("nhúng lẩu", 1.1, 1.1, 2, 2),
    ]

    # 3. THƯƠNG HIỆU & ĐỒ GÓI (Thêm dữ liệu thực tế)
    brands = [
        ("Mì Hảo Hảo tôm chua cay", "gói", 350, 7, 50, 12),
        ("Mì Omachi sốt bò hầm", "gói", 380, 8, 55, 14),
        ("Mì Indomie Goreng", "gói", 400, 9, 60, 16),
        ("Bánh Chocopie", "cái", 120, 1, 18, 5),
        ("Bánh Custas", "cái", 110, 2, 15, 6),
        ("Snack Oishi tôm", "gói", 150, 1, 20, 8),
        ("Snack Lay's khoai tây", "gói", 160, 2, 18, 10),
        ("Xúc xích Vissan", "cây", 80, 4, 2, 6),
        ("Sữa Milo hộp", "hộp", 110, 3, 18, 3),
        ("Sữa TH True Milk", "hộp", 106, 3.5, 12, 3.5),
        ("Sữa đặc Ông Thọ", "thìa", 60, 1, 10, 2),
        ("Coca Cola", "lon", 140, 0, 35, 0),
        ("Pepsi", "lon", 145, 0, 36, 0),
        ("Trà xanh C2", "chai", 80, 0, 20, 0),
        ("Nước tăng lực Redbull", "lon", 110, 0, 28, 0),
        ("Gà rán KFC (đùi)", "cái", 300, 18, 10, 20),
        ("Burger bò McDonald's", "cái", 250, 12, 30, 9),
        ("Khoai tây chiên Lotteria", "phần", 320, 4, 45, 15),
    ]

    count = 0
    
    # --- VÒNG LẶP SINH DỮ LIỆU ---
    
    # A. Sinh món ăn từ Nguyên liệu + Cách chế biến
    for nl_name, nl_cal, nl_pro, nl_carb, nl_fat, nl_fiber, nl_vit, nl_loai in nguyen_lieu:
        for cb_name, he_so_cal, he_so_fat, fat_add, carb_add in che_bien:
            # Tạo tên món mới
            new_name = f"{nl_name} {cb_name}"
            
            # Tính toán dinh dưỡng
            new_cal = round(nl_cal * he_so_cal)
            new_pro = round(nl_pro * 0.95, 1) # Protein giảm nhẹ do nhiệt
            new_fat = round(nl_fat * he_so_fat + fat_add, 1)
            new_carb = round(nl_carb + carb_add, 1)
            new_fiber = nl_fiber
            
            # Tạo ID độc nhất
            new_id = f"GEN_{count + 1000}"
            
            try:
                cursor.execute("""
                    INSERT INTO ThucPham (MaThucPham, TenThucPham, DonVi, Calories, Protein, Carbs, ChatBeo, ChatXo, Vitamin, MaLoai)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (new_id, new_name, "dĩa/phần", new_cal, new_pro, new_carb, new_fat, new_fiber, nl_vit, nl_loai))
                count += 1
            except:
                pass # Bỏ qua nếu trùng

    # B. Sinh dữ liệu Thương hiệu
    for name, unit, cal, pro, carb, fat in brands:
        new_id = f"BR_{count + 2000}"
        try:
            cursor.execute("""
                INSERT INTO ThucPham (MaThucPham, TenThucPham, DonVi, Calories, Protein, Carbs, ChatBeo, ChatXo, Vitamin, MaLoai)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (new_id, name, unit, cal, pro, carb, fat, 0, "None", "L999"))
            count += 1
        except:
            pass

    conn.commit()
    
    # Kiểm tra tổng số lượng
    total = cursor.execute("SELECT COUNT(*) FROM ThucPham").fetchone()[0]
    conn.close()
    
    print(f"🎉 Đã sinh thêm {count} món ăn mới.")
    print(f"📊 TỔNG CỘNG TRONG DATABASE: {total} MÓN.")
    print("👉 Database của bạn giờ đã đủ sức cân mọi loại món ăn!")

if __name__ == "__main__":
    seed_massive_data()