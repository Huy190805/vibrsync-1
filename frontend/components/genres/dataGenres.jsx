// Dữ liệu cho phần Mood & Activity
const moodAndActivityData = [
  {
    title: "Happy Vibes",
    image: "./genres/h1.08.jpg",
    subtitle: "Uplifting tracks to brighten your day",
    time: "10/02/2023",
    followers: 3200,
    playlists: [
      { title: "Pop", href: "/playlistByGenre", genre: "Pop" },
      { title: "Ballad", href: "/playlistByGenre", genre: "Ballad" },
      { title: "Pop and Ballad", href: "/playlistByGenre", genre: "Pop and Ballad" },
    ],
  },
  {
    title: "Chill / Relax",
    image: "./genres/h1.04.jpg",
    subtitle: "Soothing melodies for unwinding",
    time: "25/04/2023",
    followers: 1800,
    playlists: [
      { title: "Chill/Relax", href: "/playlistByGenre", genre: "Chill/Relax" },
      { title: "Coffee and Chill/Relax", href: "/playlistByGenre", genre: "Coffee and Chill/Relax" },
    ],
  },
  {
    title: "Gaming",
    image: "./genres/h1.07.jpg",
    subtitle: "Energetic beats for epic gaming sessions",
    time: "15/06/2023",
    followers: 2500,
    playlists: [
      { title: "Lofi Gaming", href: "/playlistByGenre", genre: "Lo-fi" },
      { title: "EDM Gaming", href: "/playlistByGenre", genre: "EDM" },
      { title: "R&B Gaming", href: "/playlistByGenre", genre: "R&B" },
    ],
  },
  {
    title: "Love life",
    image: "./genres/h1.09.jpg",
    subtitle: "Romantic tunes for heartfelt moments",
    time: "20/08/2023",
    followers: 2800,
    playlists: [
      { title: "Love", href: "/playlistByGenre", genre: "Love" },
      { title: "Coffee and Love", href: "/playlistByGenre", genre: "Coffee and Love" },
      { title: "Love and Chill/Relax", href: "/playlistByGenre", genre: "Love and Chill/Relax" },
    ],
  },
  {
    title: "Hometown",
    image: "./genres/h1.03.jpg",
    subtitle: "Nostalgic songs that feel like home",
    time: "05/10/2023",
    followers: 1500,
    playlists: [
      { title: "Contemporary Folk", href: "/playlistByGenre", genre: "Contemporary Folk" },
      { title: "Contemporary Folk and Love", href: "/playlistByGenre", genre: "Contemporary Folk and Love" },
    ],
  },
  {
    title: "Dance-pop",
    image: "./genres/h1.010.jpg",
    subtitle: "High-energy tracks to get you moving",
    time: "12/12/2023",
    followers: 3400,
    playlists: [
      { title: "Dance-pop", href: "/playlistByGenre", genre: "Dance-pop" },
      { title: "Dance and Dance-pop", href: "/playlistByGenre", genre: "Dance and Dance-pop" },
    ],
  },
];

// Dữ liệu cho phần Genres, chia theo thể loại (Pop & Ballad, Vietnamese, UK-US, Korean)
const genresData = [
  {
    title: "Pop & Ballad",
    items: [
      {
        title: "V-Pop Hits",
        image: "./genres/h2.01.jpg",
        subtitle: "Sơn Tùng M-TP, Bích Phương, trending pop anthems",
        genre: "Pop",
        time: "15/01/2023",
        followers: 2500,
      },
      {
        title: "Ballad Bliss",
        image: "./genres/h2.02.jpg",
        subtitle: "Hương Tràm, Đức Phúc, soulful melodies that touch the heart",
        genre: "Ballad",
        time: "22/03/2023",
        followers: 1800,
      },
      {
        title: "Pop Ballad Vibes",
        image: "./genres/h2.03.jpg",
        subtitle: "Mỹ Tâm, Noo Phước Thịnh, a perfect blend of pop and ballad",
        genre: "Pop and Ballad",
        time: "10/05/2023",
        followers: 3200,
      },
      {
        title: "Pop Dance Party",
        image: "./genres/h2.04.jpg",
        subtitle: "Tóc Tiên, Hoàng Thùy Linh, high-energy pop and dance beats",
        genre: "Pop and Dance-pop",
        time: "18/07/2023",
        followers: 2800,
      },
      {
        title: "Pop R&B Groove",
        image: "./genres/h2.05.jpg",
        subtitle: "Binz, Soobin Hoàng Sơn, smooth pop and R&B fusion",
        genre: "Pop and R&B",
        time: "25/09/2023",
        followers: 2100,
      },
    ],
  },
  {
    title: "Vietnamese",
    items: [
      {
        title: "V-Pop Energy",
        image: "./genres/h3.01.jpg",
        subtitle: "Đen Vâu, Hoàng Thùy Linh, vibrant V-Pop hits",
        genre: "Pop and Vietnamese",
        time: "12/02/2023",
        followers: 3500,
      },
      {
        title: "Chill V-Pop",
        image: "./genres/h3.02.jpg",
        subtitle: "Văn Mai Hương, Lê Hiếu, relaxing and soulful tunes",
        genre: "Chill/Relax and Vietnamese",
        time: "30/04/2023",
        followers: 1700,
      },
      {
        title: "Viet Rap Flow",
        image: "./genres/h3.03.jpg",
        subtitle: "Binz, Karik, the hottest rap verses in Vietnam",
        genre: "Rap and Vietnamese",
        time: "15/06/2023",
        followers: 2900,
      },
      {
        title: "V-Ballad Stories",
        image: "./genres/h3.04.jpg",
        subtitle: "Trịnh Thăng Bình, Erik, heartfelt ballads of love",
        genre: "Ballad and Vietnamese",
        time: "20/11/2022",
        followers: 2300,
      },
      {
        title: "Contemporary Folk Vibes",
        image: "./genres/h3.05.jpg",
        subtitle: "Phan Mạnh Quỳnh, Vũ, modern folk with a hometown feel",
        genre: "Contemporary Folk and Vietnamese",
        time: "05/08/2023",
        followers: 1900,
      },
    ],
  },
  {
    title: "UK-US",
    items: [
      {
        title: "US-UK Pop Bangers",
        image: "./genres/h5.01.jpg",
        subtitle: "Dua Lipa, The Weeknd, chart-topping pop hits",
        genre: "UK-US and Pop",
        time: "08/03/2023",
        followers: 4500,
      },
      {
        title: "Synth-Pop Dreams",
        image: "./genres/h5.02.jpg",
        subtitle: "CHVRCHES, Tame Impala, mesmerizing synth-pop sounds",
        genre: "UK-US and Synth-pop",
        time: "14/05/2023",
        followers: 2000,
      },
      {
        title: "US-UK Dance Floor",
        image: "./genres/h5.03.jpg",
        subtitle: "Calvin Harris, Zedd, electrifying dance anthems",
        genre: "UK-US and Dance",
        time: "27/07/2023",
        followers: 3100,
      },
      {
        title: "US-UK R&B Soul",
        image: "./genres/h5.04.jpg",
        subtitle: "SZA, Frank Ocean, smooth and soulful R&B",
        genre: "UK-US and R&B",
        time: "19/09/2023",
        followers: 2600,
      },
    ],
  },
  {
    title: "Korean",
    items: [
      {
        title: "K-Pop Explosion",
        image: "./genres/h4.01.jpg",
        subtitle: "BTS, BLACKPINK, global K-Pop sensations",
        genre: "Korean and Pop",
        time: "03/04/2023",
        followers: 5200,
      },
      {
        title: "K-R&B Serenity",
        image: "./genres/h4.02.jpg",
        subtitle: "Dean, Heize, soothing Korean R&B vibes",
        genre: "Korean and R&B",
        time: "16/06/2023",
        followers: 1800,
      },
      {
        title: "K-Dance Party",
        image: "./genres/h4.03.jpg",
        subtitle: "TWICE, SEVENTEEN, infectious K-Pop dance tracks",
        genre: "Korean and Dance-pop",
        time: "29/08/2023",
        followers: 3400,
      },
    ],
  },
];

// Hàm mô phỏng gọi API cho dữ liệu Mood & Activity
export const fetchMoodAndActivityData = async () => {
  // Tạo độ trễ giả lập như gọi API thật
  await new Promise((resolve) => setTimeout(resolve, 500));
  return moodAndActivityData;
};

// Hàm mô phỏng gọi API cho dữ liệu Genres theo tên thể loại
export const fetchGenreData = async (genreTitle) => {
  // Tạo độ trễ giả lập như gọi API thật
  await new Promise((resolve) => setTimeout(resolve, 500));
  return genresData.find((g) => g.title === genreTitle) || { title: genreTitle, items: [] };
};

// Danh sách các tiêu đề thể loại để sử dụng trong page.jsx
export const genreTitles = ["Pop & Ballad", "Vietnamese", "UK-US", "Korean"];