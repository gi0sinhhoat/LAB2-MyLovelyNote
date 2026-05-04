from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import firebase_admin
from firebase_admin import credentials, auth
import sqlite3
import sys

# 1. Khởi tạo Firebase Admin
try:
    cred = credentials.Certificate("../config/serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
except Exception as e:
    print("Lỗi khởi tạo Firebase. Hãy kiểm tra lại file serviceAccountKey.json:", e)
    sys.exit(1)   

# 2. Khởi tạo FastAPI app
app = FastAPI()

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong thực tế nên để đúng domain của frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Khởi tạo Cơ sở dữ liệu SQLite
def init_db():
  
    with sqlite3.connect("note.db", check_same_thread=False) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                author_email TEXT NOT NULL
            )
        """)
        conn.commit()

init_db()

# 4. Định nghĩa cấu trúc dữ liệu (Pydantic Model)
class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=10000)

def verify_firebase_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Thiếu hoặc sai định dạng Token")

    token = authorization.split(" ")[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception:
        raise HTTPException(status_code=401, detail="Token không hợp lệ hoặc đã hết hạn")



@app.get("/")
def read_root():
    return {"status": "Backend đang chạy ngon lành!"}

@app.get("/posts")
def get_posts():
    with sqlite3.connect("note.db", check_same_thread=False) as conn:
        cursor = conn.cursor()
        # QUAN TRỌNG: Phải lấy thêm trường 'id'
        cursor.execute("SELECT id, title, content, author_email FROM posts ORDER BY id DESC")
        posts = [
            {"id": row[0], "title": row[1], "content": row[2], "author_email": row[3]}
            for row in cursor.fetchall()
        ]
    return posts
@app.post("/posts")
def create_post(post: PostCreate, user: dict = Depends(verify_firebase_token)):
    email = user.get("email", "Unknown User")

     
    with sqlite3.connect("note.db", check_same_thread=False) as conn:
        conn.execute(
            "INSERT INTO posts (title, content, author_email) VALUES (?, ?, ?)",
            (post.title, post.content, email)
        )
        conn.commit()

    return {"ok": True, "message": "Đăng ghi chú thành công", "author": email}

@app.delete("/posts/{post_id}")
def delete_post(post_id: int, user: dict = Depends(verify_firebase_token)):
    with sqlite3.connect("note.db", check_same_thread=False) as conn:
        cursor = conn.cursor()
        
    
        cursor.execute("SELECT author_email FROM posts WHERE id = ?", (post_id,))
        post = cursor.fetchone()
        
        if not post:
            raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")

    
        cursor.execute("DELETE FROM posts WHERE id = ?", (post_id,))
        conn.commit()
        
    return {"message": "Đã xoá bài viết thành công!"}