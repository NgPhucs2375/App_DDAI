import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ==========================================
# 1. CẤU HÌNH KẾT NỐI
# ==========================================

# Database CŨ (Trên máy tính)
LOCAL_DB_URL = "sqlite:///./dulieu.db"

# Database MỚI (Trên Render)
# 👇 DÁN LINK EXTERNAL DB CỦA BẠN VÀO DƯỚI ĐÂY 👇
RENDER_DB_URL = "postgresql://user:umasxOWB7rF2ZWkbnj5AmhO6q72JqVlc@dpg-d4qnob0gjchc73bfht1g-a.singapore-postgres.render.com/nutrition_db_1odk"  # <--- Thay bằng link của bạn

# Fix lỗi link của Render nếu có
if RENDER_DB_URL.startswith("postgres://"):
    RENDER_DB_URL = RENDER_DB_URL.replace("postgres://", "postgresql://", 1)

# ==========================================
# 2. ĐỊNH NGHĨA MODEL (Để Python hiểu dữ liệu)
# ==========================================
Base = declarative_base()

class ThucPham(Base):
    __tablename__ = "ThucPham"
    MaThucPham = Column(String, primary_key=True, index=True) 
    TenThucPham = Column(String)
    DonVi = Column(String)
    Calories = Column(Float)
    Protein = Column(Float)
    Carbs = Column(Float)
    ChatBeo = Column(Float)
    ChatXo = Column(Float)
    Vitamin = Column(String)
    is_verified = Column(Boolean, default=False)

# ==========================================
# 3. QUY TRÌNH CHUYỂN NHÀ
# ==========================================
def migrate_data():
    print("🚀 Bắt đầu chuyển dữ liệu...")

    # 1. Kết nối nguồn (Local)
    try:
        src_engine = create_engine(LOCAL_DB_URL)
        SrcSession = sessionmaker(bind=src_engine)
        src_db = SrcSession()
        print("✅ Đã kết nối Database Local (dulieu.db)")
    except Exception as e:
        print(f"❌ Lỗi kết nối Local DB: {e}")
        return

    # 2. Kết nối đích (Render)
    try:
        dest_engine = create_engine(RENDER_DB_URL)
        DestSession = sessionmaker(bind=dest_engine)
        dest_db = DestSession()
        print("✅ Đã kết nối Database Render")
    except Exception as e:
        print(f"❌ Lỗi kết nối Render DB: {e}")
        return

    # 3. Lấy toàn bộ dữ liệu từ Local
    local_foods = src_db.query(ThucPham).all()
    print(f"📦 Tìm thấy {len(local_foods)} món ăn trong máy của bạn.")

    if len(local_foods) == 0:
        print("⚠️ Database máy bạn trống rỗng, không có gì để chuyển!")
        return

    # 4. Bơm lên Render
    count_success = 0
    count_skip = 0

    print("⏳ Đang tải lên (Vui lòng đợi)...")
    
    for food in local_foods:
        # Kiểm tra xem món này đã có trên Render chưa (tránh trùng)
        exists = dest_db.query(ThucPham).filter(ThucPham.MaThucPham == food.MaThucPham).first()
        
        if not exists:
            # Tạo bản sao
            new_food = ThucPham(
                MaThucPham=food.MaThucPham,
                TenThucPham=food.TenThucPham,
                DonVi=food.DonVi,
                Calories=food.Calories,
                Protein=food.Protein,
                Carbs=food.Carbs,
                ChatBeo=food.ChatBeo,
                ChatXo=food.ChatXo,
                Vitamin=food.Vitamin,
                is_verified=True # Cho phép hiển thị luôn
            )
            dest_db.add(new_food)
            count_success += 1
        else:
            count_skip += 1

    try:
        dest_db.commit()
        print("========================================")
        print(f"🎉 THÀNH CÔNG RỰC RỠ!")
        print(f"✅ Đã thêm mới: {count_success} món")
        print(f"⏭️ Đã bỏ qua (trùng): {count_skip} món")
        print("========================================")
    except Exception as e:
        print(f"❌ Lỗi khi lưu: {e}")
        dest_db.rollback()
    finally:
        src_db.close()
        dest_db.close()

if __name__ == "__main__":
    migrate_data()