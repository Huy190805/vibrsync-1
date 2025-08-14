import os
from cloudinary_upload import upload_audio, upload_image  # cùng thư mục

# ✅ Lấy đường dẫn gốc dự án
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

# ✅ Đường dẫn mới theo vị trí thực tế trong frontend/public/
artist_folder = os.path.join(base_dir, "frontend", "public", "Artist")
audio_folder = os.path.join(base_dir, "frontend", "public", "audioMusic")

# ✅ Upload ảnh nghệ sĩ
def upload_all_images():
    print("🚀 Uploading artist images...")
    print("🔎 Looking for folder:", artist_folder)
    try:
        for filename in os.listdir(artist_folder):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                file_path = os.path.join(artist_folder, filename)
                url = upload_image(file_path)
                if url:
                    print(f"✅ {filename} → {url}")
                else:
                    print(f"❌ Failed: {filename}")
    except FileNotFoundError:
        print("❌ Folder not found:", artist_folder)

# ✅ Upload file audio


if __name__ == "__main__":
    upload_all_images()

