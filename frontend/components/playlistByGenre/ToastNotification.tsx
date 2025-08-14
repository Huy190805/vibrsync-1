"use client";

// Chỉ định rằng đây là Client Component trong Next.js, cho phép sử dụng các tính năng phía client như hook useState.
import { useState } from "react";
import { Star } from "lucide-react";

// Thành phần ToastNotification để hiển thị thông báo nổi trên giao diện.
function ToastNotification() {
  // Sử dụng hook useState để quản lý trạng thái của thông báo (toast), mặc định là chuỗi rỗng.
  const [toast, setToast] = useState("");

  return (
    <>
      {/* Chỉ hiển thị thông báo nếu biến toast có giá trị (không rỗng) */}
      {toast && (
        // Container cho thông báo với vị trí cố định ở góc trên bên phải, nền gradient, và hiệu ứng fade-in.
        <div className="fixed top-4 right-4 bg-gradient-to-r from-[#39FF14] to-[#00CED1] text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in flex items-center gap-2 max-w-xs">
          {/* Biểu tượng ngôi sao từ thư viện lucide-react, kích thước 18px, được tô màu đồng bộ với văn bản */}
          <Star size={18} fill="currentColor" />
          {/* Hiển thị nội dung thông báo từ biến toast */}
          {toast}
        </div>
      )}
    </>
  );
}

export default ToastNotification;