// // frontend/app/discovery/top100.jsx
// "use client";
// import { useState, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";

// // Danh sách ảnh có sẵn trong thư mục public
// const availableImages = [
//   "/h5.02.jpg",
//   "/h5.01.jpg",
//   "/h4.03.jpg",
//   "/h2.02.jpg",
//   "/h5.04.jpg",
//   "/h3.01.jpg",
//   "/h2.02.jpg",
//   "/h3.01.jpg"
// ];

// export default function Top100() {
//   const [charts, setCharts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Dữ liệu mẫu với ảnh từ thư mục public
//     const sampleData = [
//       {
//         title: "Top 100 V-Pop",
//         subtitle: "Hòa Minzy, Tăng Duy Tân...",
//         image: availableImages[6], // placeholder.jpg
//         href: "/charts/vpop"
//       },
//       {
//         title: "Top 100 K-POP",
//         subtitle: "Taylor Swift, Ed Sheeran...",
//         image: availableImages[0], // blinding-lights-album-cover.png
//         href: "/charts/kpop"
//       },
//       {
//         title: "Top 100 EDM",
//         subtitle: "Alan Walker, Martin Garrix...",
//         image: availableImages[1], // music-concert-stage-colorful-lighting.png
//         href: "/charts/edm"
//       },
//       {
//         title: "Top 100 US-UK",
//         subtitle: "Quynh Trang, Duong Hong Loan...",
//         image: availableImages[5], // robot.jpg
//         href: "/charts/usuk"
//       },
//       {
//         title: "Top 100 LOVE Music",
//         subtitle: "Quang Hung MasterD...",
//         image: availableImages[6], // save-your-tears-album-cover.png
//         href: "/charts/love"
//       }
//     ];

//     // Giả lập fetch API
//     setTimeout(() => {
//       setCharts(sampleData);
//       setLoading(false);
//     }, 500);
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <section className="p-4">
//       <h2 className="text-2xl font-bold mb-4">Top 100</h2>
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//         {charts.map((item, index) => (
//           <Link
//             key={index}
//             href={item.href}
//             className="bg-white/5 hover:bg-white/10 rounded-lg overflow-hidden transition group"
//           >
//             <div className="relative w-full aspect-square">
//               <Image
//                 src={item.image}
//                 alt={item.title}
//                 fill
//                 className="object-cover"
//                 sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
//                 priority={index < 3}
//                 onError={(e) => {
//                   e.currentTarget.src = '/placeholder.jpg';
//                 }}
//               />
//             </div>
//             <div className="p-3">
//               <h3 className="font-semibold truncate group-hover:text-blue-400 transition-colors">
//                 {item.title}
//               </h3>
//               <p className="text-sm text-gray-400 truncate">{item.subtitle}</p>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </section>
//   );
// }