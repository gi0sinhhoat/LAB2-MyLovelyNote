


# LAB2

## Giới thiệu dự án

Dự án này là một web ghi chú cho phép người dùng thực hiện các tính năng:

### Xác thực người dùng

* Đăng nhập thông qua Google Firebase Authentication.

### Quản lý ghi chú

* Tạo ghi chú mới (bao gồm tiêu đề và nội dung).
* Hiển thị danh sách ghi chú từ cơ sở dữ liệu.
* Xóa ghi chú cá nhân.

### Công nghệ sử dụng

* **Backend:** FastAPI (Python) + SQLite
* **Frontend:** HTML/CSS (giao diện Glassmorphism) + JavaScript thuần

---

## Cách chạy dự án

### 1. Cài đặt môi trường

**Yêu cầu hệ thống:**

* Python 3.10+
* Node.js (để sử dụng npm)

**Các bước:**

```bash
pip install -r requirements.txt
```

---

### 2. Chạy Backend

Di chuyển vào thư mục backend:

```bash
cd backend
```

Khởi động server:

```bash
py -m uvicorn main:app --reload
```
---

### 3. Chạy Frontend

* Mở dự án bằng VS Code
* Chuột phải vào file:

```
frontend/index.html
```

* Chọn **Open with Live Server**

### 4. Video demo
https://youtu.be/c_IKZeE-cDM



