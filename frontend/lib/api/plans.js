export function getPlans() {
  return [
    {
      id: 1,
      type: "plus",
      label: "Plus",
      description: "Nghe nhạc không quảng cáo, khoáng quảng cáo",
      price: 13000,
      benefits: [
        "Nghe nhạc không quảng cáo",
        "Nghe và tải nhạc Lossless",
        "Lưu trữ nhạc không giới hạn",
        "Tính năng nghe nhạc nâng cao",
        "Mở rộng khả năng Upload"
      ]
    },
    {
      id: 2,
      type: "premium",
      label: "Premium",
      description: "Toàn bộ gói quyển Plus cùng kho nhạc Premium",
      price: 41000,
      benefits: [
        "Kho nhạc Premium",
        "Nghe nhạc không quảng cáo",
        "Nghe và tải nhạc Lossless",
        "Lưu trữ nhạc không giới hạn",
        "Tính năng nghe nhạc nâng cao",
        "Mở rộng khả năng Upload"
      ]
    }
  ];
}