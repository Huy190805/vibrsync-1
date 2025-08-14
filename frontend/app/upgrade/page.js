"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";

export default function UpgradePage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // "plus" hoặc "premium"
  const { user } = useAuth(); // Lấy user từ context auth
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);

  const isPlus = type === "plus";
  const gradientFrom = isPlus ? "#4B0082" : "#D4A017";
  const gradientTo = isPlus ? "#1A001A" : "#8A5A00";
  const checkmarkColor = isPlus ? "text-purple-500" : "text-yellow-500";
  const buttonColor = isPlus ? "bg-purple-600 hover:bg-purple-700" : "bg-yellow-600 hover:bg-yellow-700";
  const borderColor = isPlus ? "border-purple-500" : "border-yellow-500";
  const labelBgColor = isPlus ? "bg-purple-600 text-white" : "bg-yellow-500 text-black";
  const discountColor = isPlus ? "text-purple-300" : "text-yellow-300";
  const noteColor = isPlus ? "text-purple-300" : "text-yellow-300";

  const plusPlans = [
    { duration: "12 tháng", price: 159000, discount: "Tiết kiệm 30%", monthly: "Chỉ 13.000đ/tháng" },
    { duration: "6 tháng", price: 89000, discount: "Tiết kiệm 20%", monthly: "Chỉ 15.000đ/tháng" },
    { duration: "1 tháng", price: 19000 },
    { duration: "1 tháng Family", price: 49000, note: "Gói chỉ bán trên web" },
  ];

  const premiumPlans = [
    { duration: "12 tháng", price: 499000, discount: "Tiết kiệm 15%", monthly: "Chỉ 41.000đ/tháng" },
    { duration: "6 tháng", price: 279000, discount: "Tiết kiệm 15%", monthly: "Chỉ 46.000đ/tháng" },
    { duration: "1 tháng", price: 49000 },
    { duration: "1 tháng Family", price: 89000, note: "Gói chỉ bán trên web" },
  ];

  const plusPrivileges = [
    "Nghe nhạc không quảng cáo",
    "Nghe và tải nhạc Lossless",
    "Lưu trữ nhạc không giới hạn",
    "Tính năng nghe nhạc nâng cao",
    "Mở rộng khả năng Upload",
  ];

  const premiumPrivileges = [
    "Kho nhạc Premium",
    "Nghe nhạc không quảng cáo",
    "Nghe và tải nhạc Lossless",
    "Lưu trữ nhạc không giới hạn",
    "Tính năng nghe nhạc nâng cao",
    "Mở rộng khả năng Upload",
  ];

  const plans = isPlus ? plusPlans : premiumPlans;
  const privileges = isPlus ? plusPrivileges : premiumPrivileges;

  const handlePlanChange = (index) => setSelectedPlan(index);

  const formatDate = (date) =>
    date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const today = new Date();
  const getMonthsFromDuration = (duration) => {
    const match = duration.match(/(\d+)\s*tháng/);
    return match ? parseInt(match[1]) : 0;
  };

  const nextBillingDate = new Date(today);
  nextBillingDate.setMonth(today.getMonth() + getMonthsFromDuration(plans[selectedPlan].duration));

  const handlePayment = async () => {
    if (!agreed) {
      alert("Vui lòng đồng ý với Chính sách thanh toán trước khi tiếp tục.");
      return;
    }
    if (!user) {
      alert("Bạn cần đăng nhập trước khi thanh toán.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          username: user.name,
          method: "momo", 
          plan_type: isPlus ? "plus" : "premium",
          duration: plans[selectedPlan].duration,
          amount: plans[selectedPlan].price,
          created_at: new Date().toISOString(),
        }),
      });
      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Tạo thanh toán thành công nhưng không có link thanh toán!");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Có lỗi xảy ra khi tạo thanh toán.");
    }
    setLoading(false);
  };

  return (
    <main
      className="text-white min-h-screen relative overflow-hidden"
      style={{ background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` }}
    >
      {/* SVG nền */}
      <svg
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 left-0 w-[300px] h-[300px] pointer-events-none"
      >
        <polygon points="0,0 300,0 240,60 0,60" fill={isPlus ? "#7B2CBF" : "#E6B422"} />
        <polygon points="0,60 240,60 180,120 0,120" fill={isPlus ? "#5A189A" : "#C99700"} />
        <polygon points="0,120 180,120 120,180 0,180" fill={isPlus ? "#3C096C" : "#8A5A00"} />
      </svg>

      <section className="flex flex-col items-center justify-center px-4 py-10 relative z-10">
        <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          VibeSync{" "}
          <span className={`px-4 py-2 text-sm rounded-full font-semibold ${labelBgColor}`}>
            {isPlus ? "Plus" : "Premium"}
          </span>
        </h1>
        <div className="w-full max-w-3xl flex gap-6">
          {/* Chọn gói */}
          <div className="w-1/2 bg-gray-900 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-200">Chọn gói nâng cấp</h2>
            {plans.map((plan, index) => (
              <label
                key={index}
                className={`block mb-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedPlan === index
                    ? `bg-gradient-to-b from-[${gradientFrom}] to-[${gradientTo}] border-4 ${borderColor} shadow-md`
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="plan"
                      checked={selectedPlan === index}
                      onChange={() => handlePlanChange(index)}
                      className={`mr-4 w-5 h-5 ${isPlus ? "accent-purple-500" : "accent-yellow-500"}`}
                    />
                    <div>
                      <p className="font-bold text-white">{plan.duration}</p>
                      <p className="text-xl font-bold text-white">{plan.price.toLocaleString()}đ</p>
                      {plan.discount && <p className={`text-sm ${discountColor}`}>{plan.discount}</p>}
                      {plan.monthly && <p className="text-xs text-gray-400">{plan.monthly}</p>}
                      {plan.note && <p className={`text-xs ${noteColor}`}>{plan.note}</p>}
                    </div>
                  </div>
                  <span className="w-5 h-5 flex items-center justify-center">
                    {selectedPlan === index && <span className="text-2xl text-white">●</span>}
                  </span>
                </div>
              </label>
            ))}
          </div>

          {/* Thông tin & Thanh toán */}
      <div className="w-1/2 bg-gray-900 rounded-2xl p-6 shadow-lg">
       <p className="text-sm text-gray-400 mb-1">Tài khoản</p>
        <div className="flex items-center gap-3 mb-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-700">
        <Image
        src={user?.avatar || "/placeholder.svg"}
        alt="Profile"
        fill
        className="object-cover"
         />
         </div>
         <p className="text-sm text-gray-200 font-semibold">
         {user?.name || "User"}
          </p>
           </div>
            <p className="text-sm text-gray-400 mb-1">Thời điểm nâng cấp</p>
            <p className="text-sm mb-2 text-gray-200">{formatDate(today)}</p>
            <p className="text-sm text-gray-400 mb-1">Hiệu lực đến</p>
            <p className="text-sm mb-2 text-gray-200">Khi bạn hủy</p>
            <p className="text-sm text-gray-400 mb-1">Kỳ thanh toán tiếp theo</p>
            <p className="text-sm mb-6 text-gray-200">{formatDate(nextBillingDate)}</p>
            <p className="text-sm text-gray-400 mb-1">Tổng thanh toán:</p>
            <div className="flex items-center justify-between mb-4">
              <p className="text-3xl font-bold text-white">
                {plans[selectedPlan].price.toLocaleString()}đ
              </p>
              <button
                className={`px-6 py-3 rounded-full font-bold uppercase ${buttonColor} text-white shadow-md`}
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "ĐĂNG KÝ"}
              </button>
            </div>
            <label className="flex items-center text-xs text-gray-400 mb-8">
              <input
                type="checkbox"
                className={`mr-2 ${isPlus ? "accent-purple-500" : "accent-yellow-500"}`}
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              Khi nâng cấp, bạn đã đồng ý với Chính sách thanh toán của chúng tôi.
            </label>
            <h2 className="text-lg font-semibold mb-4 text-gray-200">
              Đặc quyền gói {isPlus ? "PLUS" : "PREMIUM"}
            </h2>
            <ul className="space-y-2 text-sm">
              {privileges.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className={`${checkmarkColor} font-bold`}>✓</span>
                  <span className="text-gray-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
