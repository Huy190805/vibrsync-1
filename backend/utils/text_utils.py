import unicodedata
import re

def normalize_text(text: str) -> str:
    # Chuyển thành chữ thường
    text = text.lower()

    # Loại bỏ dấu tiếng Việt
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')

    # Loại bỏ ký tự đặc biệt, giữ lại chữ cái và khoảng trắng
    text = re.sub(r'[^\w\s]', '', text)

    # Loại bỏ khoảng trắng dư thừa
    text = re.sub(r'\s+', ' ', text).strip()

    return text