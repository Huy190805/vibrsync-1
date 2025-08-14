"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { fetchAlbumById, fetchAlbums } from "@/lib/api/albums";
import { fetchSongsByIds } from "@/lib/api/songs";
import { fetchArtistById } from "@/lib/api/artists";

export default function useAlbumDetail() {
  // Lấy `id` từ URL động (ví dụ: /album/[id])
  const params = useParams();
  const searchParams = useSearchParams();
  const id = String(params.id);

  // Kiểm tra xem có đến từ mục "Other Albums" không
  const isFromOtherAlbums = searchParams.get("from") === "other";

  // Khởi tạo các state chính
  const [album, setAlbum] = useState(null);              // Thông tin album chính
  const [artist, setArtist] = useState(null);            // Nghệ sĩ của album
  const [songs, setSongs] = useState([]);                // Danh sách bài hát trong album
  const [artistAlbums, setArtistAlbums] = useState([]);  // Album khác không cùng nghệ sĩ

  const [loading, setLoading] = useState(true);          // Trạng thái tải dữ liệu
  const [error, setError] = useState(null);              // Thông báo lỗi nếu có

  useEffect(() => {
    // Hàm bất đồng bộ để tải dữ liệu chi tiết album
    async function loadAlbumData() {
      try {
        setLoading(true);

        // 👉 1. Lấy thông tin album theo ID
        const albumData = await fetchAlbumById(id);
        if (!albumData) throw new Error("Album not found");
        setAlbum(albumData);

        // 👉 2. Lấy thông tin nghệ sĩ
        const artistData = await fetchArtistById(albumData.artist_id);
        if (!artistData) throw new Error("Artist not found");
        setArtist(artistData);

        // 👉 3. Lấy danh sách bài hát trong album
        if (albumData.songs?.length > 0) {
          const songsData = await fetchSongsByIds(albumData.songs);
          setSongs(songsData);
        }

        // 👉 4. Lấy các album khác KHÔNG cùng nghệ sĩ (nếu không phải từ mục "other")
        if (!isFromOtherAlbums) {
          const albumsData = await fetchAlbums();
          const filtered = albumsData
            .filter((a) => a.artist_id !== albumData.artist_id)
            .slice(0, 4); // Giới hạn tối đa 4 album

          setArtistAlbums(filtered);
        } else {
          setArtistAlbums([]); // Nếu đến từ mục "Other", không cần hiển thị thêm
        }
      } catch (err) {
        // Xử lý lỗi nếu có
        setError(err?.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    // Gọi hàm tải dữ liệu khi component mount hoặc `id` thay đổi
    loadAlbumData();
  }, [id, isFromOtherAlbums]);

  // Trả ra các dữ liệu để sử dụng trong component Album Page
  return {
    album,
    artist,
    songs,
    artistAlbums,
    loading,
    error,
    isFromOtherAlbums,
  };
}
