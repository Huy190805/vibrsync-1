"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function PopupPortal({ children }) {
  // Trạng thái xác định component đã được render bên phía client chưa
  const [mounted, setMounted] = useState(false);

  // Khi component mount, đặt trạng thái mounted thành true
  useEffect(() => setMounted(true), []);

  // Nếu chưa mounted (chưa sẵn sàng để tạo portal), không render gì cả
  if (!mounted) return null;

  // Tạo portal hiển thị children trong document.body
  return createPortal(children, document.body);
}
