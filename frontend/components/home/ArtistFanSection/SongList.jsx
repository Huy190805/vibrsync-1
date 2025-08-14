import { memo } from "react"; // Nhập memo tối ưu re-render
import { Button } from "@/components/ui/button"; // Nhập Button từ UI
import { ChevronLeft, ChevronRight } from "lucide-react"; // Icon điều hướng
import SongCard from "./SongCard"; // Nhập SongCard
import PropTypes from "prop-types"; // Kiểm tra kiểu props

const SongList = memo(({ songs, songPageIndex, songsPerPage, artistName, onPlay, isPlaying, currentSong, onPrevPage, onNextPage }) => {
  const visibleSongs = songs.slice(songPageIndex * songsPerPage, (songPageIndex + 1) * songsPerPage); // Lấy bài hát theo trang

  return (
    <div className="border border-purple-500/20 rounded-xl p-6 bg-purple-500/5 backdrop-blur-md shadow-md">
      {/* Container danh sách bài hát */}
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevPage}
          disabled={songPageIndex === 0}
          className="text-white hover:bg-indigo-500/20 w-10 h-10 rounded-full flex items-center justify-center"
        > {/* Nút lùi trang */}
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full justify-items-center">
          {/* Lưới hiển thị bài hát */}
          {visibleSongs.length > 0 ? (
            visibleSongs.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index}
                artistName={artistName}
                onPlay={onPlay}
                isPlaying={currentSong && currentSong.id === song.id && isPlaying}
              /> // Render SongCard
            ))
          ) : (
            <p className="text-gray-400 text-center col-span-full">Không có bài hát nào để hiển thị</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextPage}
          disabled={songPageIndex >= Math.ceil(songs.length / songsPerPage) - 1}
          className="text-white hover:bg-indigo-500/20 w-10 h-10 rounded-full flex items-center justify-center"
        > {/* Nút tiến trang */}
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
});

SongList.propTypes = {
  songs: PropTypes.array.isRequired, // Mảng bài hát
  songPageIndex: PropTypes.number.isRequired, // Chỉ số trang
  songsPerPage: PropTypes.number.isRequired, // Số bài mỗi trang
  artistName: PropTypes.string.isRequired, // Tên nghệ sĩ
  onPlay: PropTypes.func.isRequired, // Hàm phát nhạc
  isPlaying: PropTypes.bool, // Trạng thái phát
  currentSong: PropTypes.object, // Bài hát hiện tại
  onPrevPage: PropTypes.func.isRequired, // Hàm lùi trang
  onNextPage: PropTypes.func.isRequired, // Hàm tiến trang
};

export default SongList; // Xuất component