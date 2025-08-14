# backend/seeds_data/seed_media.py

import os
from utils.cloudinary_upload import (
    upload_audio,
    upload_image,
    delete_audio_files,
    delete_image_files
)

AUDIO_DIR = "../frontend/public/audio"
IMAGE_DIR = "../frontend/public/image"
MAX_FILE_SIZE_MB = 10

def delete_old_files():
    print("🚮 Đang xoá file audio (sai định dạng video)...")
    delete_audio_files()
    print("🚮 Đang xoá toàn bộ ảnh cũ...")
    delete_image_files()

def upload_all_audio():
    print("🎧 Upload tất cả file audio (.mp3)...")
    if not os.path.exists(AUDIO_DIR):
        print("❌ AUDIO_DIR not found:", AUDIO_DIR)
        return
    for root, _, files in os.walk(AUDIO_DIR):
        for filename in files:
            if filename.endswith(".mp3"):
                file_path = os.path.join(root, filename)
                file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
                if file_size_mb > MAX_FILE_SIZE_MB:
                    print(f"⚠️ Bỏ qua {filename} ({file_size_mb:.2f} MB) - vượt quá 10MB")
                    continue
                url = upload_audio(file_path)
                print(f"🎵 {filename} => {url}")

def upload_all_images():
    print("🖼️ Upload tất cả ảnh...")
    if not os.path.exists(IMAGE_DIR):
        print("❌ IMAGE_DIR not found:", IMAGE_DIR)
        return
    for root, _, files in os.walk(IMAGE_DIR):
        for filename in files:
            if filename.endswith((".jpg", ".jpeg", ".png", ".webp")):
                file_path = os.path.join(root, filename)
                url = upload_image(file_path)
                print(f"🖼️ {filename} => {url}")

if __name__ == "__main__":
    delete_old_files()
    upload_all_audio()
    upload_all_images()
    print("✅ Seed hoàn tất!")
