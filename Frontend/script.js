// Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA6vXJXHjXKreeSotM--yRCvhG5r_AIubQ",
    authDomain: "note-app-a56e5.firebaseapp.com",
    projectId: "note-app-a56e5",
    storageBucket: "note-app-a56e5.firebasestorage.app",
    messagingSenderId: "452927050800",
    appId: "1:452927050800:web:33558d969317a4625189f5"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// DOM Elements[cite: 2]
const modal = document.getElementById("modal");
const submitBtn = document.getElementById("submitModal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.getElementById("closeModal");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userEmailSpan = document.getElementById("userEmail");
const listDiv = document.getElementById("list");

// View Modal[cite: 2]
const viewModal = document.getElementById("viewModal");
const closeViewModalBtn = document.getElementById("closeViewModal");

const API_URL = "http://localhost:8000";

// --- FUNCTIONS ---

// Hiển thị Modal chi tiết[cite: 2]
function openViewModal(title, content) {
    document.getElementById("viewModalTitle").textContent = title;
    document.getElementById("viewModalContent").textContent = content;
    viewModal.classList.add("open");
}

// Hàm xoá bài viết[cite: 2]
async function deletePost(id) {
    if (!confirm("Bạn có chắc chắn muốn xoá bài viết này không?")) return;

    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert("Bạn cần đăng nhập để xoá!");
            return;
        }

        const idToken = await currentUser.getIdToken(true);

        const res = await fetch(`${API_URL}/posts/${id}`, {
            method: "DELETE",
            headers: { 
                "Authorization": `Bearer ${idToken}`
            }
        });

        if (res.ok) {
            alert("Xoá thành công!");
            loadPosts();
        } else {
            const data = await res.json();
            alert("Lỗi: " + (data.detail || "Không thể xoá"));
        }
    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối server.");
    }
}

// Tải danh sách bài viết[cite: 2]
async function loadPosts() {
    try {
        const res = await fetch(`${API_URL}/posts`);
        if (!res.ok) throw new Error("Không thể tải ghi chú");
        const posts = await res.json();

        if (posts.length === 0) {
            listDiv.innerHTML = "<p>Chưa có ghi chú nào.</p>";
            return;
        }

        // Render bài viết kèm nút xoá[cite: 2]
        listDiv.innerHTML = [...posts].reverse().map(post => `
            <div class="box glass" data-title="${encodeURIComponent(post.title)}" data-content="${encodeURIComponent(post.content)}">
                <button class="btn-delete" onclick="event.stopPropagation(); deletePost('${post.id || post._id}')">Xoá</button>
                <h3>${post.title}</h3>
                <p>${post.content}</p>
            </div>
        `).join('');

        // Gán sự kiện click cho từng box để xem chi tiết[cite: 2]
        listDiv.querySelectorAll(".box").forEach(box => {
            box.addEventListener("click", () => {
                openViewModal(
                    decodeURIComponent(box.dataset.title),
                    decodeURIComponent(box.dataset.content)
                );
            });
        });
    } catch (error) {
        listDiv.innerHTML = `<p style="color: #ffcccc;">Lỗi kết nối Backend. Hãy chắc chắn FastAPI đang chạy ở ${API_URL}</p>`;
        console.error(error);
    }
}

// --- EVENT LISTENERS ---

// Đóng mở modal[cite: 2]
closeViewModalBtn.addEventListener("click", () => viewModal.classList.remove("open"));
viewModal.addEventListener("click", (e) => {
    if (e.target === viewModal) viewModal.classList.remove("open");
});

openModalBtn.addEventListener("click", () => modal.classList.add("open"));
closeModalBtn.addEventListener("click", () => modal.classList.remove("open"));

// Auth Actions[cite: 2]
loginBtn.addEventListener("click", () => {
    auth.signInWithPopup(provider).catch(error => alert("Lỗi đăng nhập: " + error.message));
});

logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => alert("Đã đăng xuất"));
});

// Lắng nghe trạng thái đăng nhập[cite: 2]
auth.onAuthStateChanged((user) => {
    if (user) {
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        openModalBtn.style.display = "inline-block";
        userEmailSpan.style.display = "inline-block";
        userEmailSpan.textContent = user.email;
    } else {
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
        openModalBtn.style.display = "none";
        userEmailSpan.style.display = "none";
    }
    loadPosts();
});

// Đăng bài mới[cite: 2]
submitBtn.addEventListener("click", async () => {
    const title = document.getElementById("titleInput").value.trim();
    const content = document.getElementById("contentInput").value.trim();

    if (!title || !content) {
        alert("Vui lòng nhập đủ tiêu đề và nội dung!");
        return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
        alert("Bạn cần đăng nhập để đăng bài!");
        return;
    }

    submitBtn.textContent = "Đang đăng...";
    submitBtn.disabled = true;

    try {
        const idToken = await currentUser.getIdToken(true);

        const res = await fetch(`${API_URL}/posts`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`
            },
            body: JSON.stringify({ title, content })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Đăng bài thành công!");
            document.getElementById("titleInput").value = "";
            document.getElementById("contentInput").value = "";
            modal.classList.remove("open");
            loadPosts();
        } else {
            alert("Lỗi từ server: " + (data.detail || "Không xác định"));
        }
    } catch (error) {
        alert("Không kết nối được server FastAPI.");
        console.error(error);
    } finally {
        submitBtn.textContent = "ĐĂNG";
        submitBtn.disabled = false;
    }
});