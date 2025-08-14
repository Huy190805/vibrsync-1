import { memo } from "react"; // Nhập memo để tối ưu hóa re-render
import Image from "next/image"; // Nhập Image từ Next.js để tối ưu hiển thị ảnh
import Link from "next/link"; // Nhập Link từ Next.js để điều hướng
import { motion } from "framer-motion"; // Nhập motion cho hiệu ứng animation
import { Badge } from "@/components/ui/badge"; // Nhập Badge từ UI components
import { Music } from "lucide-react"; // Nhập icon Music từ Lucide
import PropTypes from "prop-types"; // Nhập PropTypes để kiểm tra kiểu props

const formatTime = (timeLeft) => {
  // Chuyển đổi thời gian (giây) thành định dạng phút:giây
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const ArtistHeader = memo(({ artist, timeLeft, onNextArtist }) => {
  // Component hiển thị header nghệ sĩ, dùng memo để tối ưu
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
      <div className="flex items-center gap-4">
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }} // Phóng to khi hover
          transition={{ duration: 0.2 }}
        >
          <Image
            src={artist.avatar || "https://via.placeholder.com/80"} // Ảnh đại diện nghệ sĩ
            alt={artist.name || "Nghệ sĩ không xác định"}
            width={80}
            height={80}
            className="rounded-full object-cover border-4 border-indigo-500 shadow-lg"
            loading="lazy" // Tải ảnh theo chế độ lazy
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-md">
            <Music className="w-4 h-4 text-white" /> {/* Icon Music ở góc ảnh */}
          </div>
        </motion.div>
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">
             For Fans of {artist.name || "Nghệ sĩ không xác định"} {/* Tên nghệ sĩ với gradient */}
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/50">
              {artist.followers || "0M"} followers  {/* Hiển thị số người theo dõi */}
            </Badge>
            <span className="text-sm text-gray-400">
               Time: {formatTime(timeLeft)}  {/* Hiển thị thời gian còn lại */}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/viewAll/artists" // Liên kết đến trang danh sách nghệ sĩ
          className="text-sm font-medium text-[#39FF14] hover:underline hover:text-white transition-colors"
        >
          View All
        </Link>
      </div>
    </div>
  );
});

ArtistHeader.propTypes = {
  artist: PropTypes.object.isRequired, // Thông tin nghệ sĩ
  timeLeft: PropTypes.number.isRequired, // Thời gian còn lại
  onNextArtist: PropTypes.func.isRequired, // Hàm chuyển nghệ sĩ
};

export default ArtistHeader; // Xuất component