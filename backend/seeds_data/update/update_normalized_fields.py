from database.db import songs_collection, artists_collection, albums_collection
import unicodedata

def normalize(text: str) -> str:
    return ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn').lower()

# ✅ Update songs
count = 0
for song in songs_collection.find():
    title = song.get("title", "")
    norm = normalize(title)
    if norm and song.get("normalizedTitle") != norm:
        songs_collection.update_one(
            {"_id": song["_id"]},
            {"$set": {"normalizedTitle": norm}}
        )
        count += 1
print(f"✅ Updated {count} songs")

# ✅ Update artists
count = 0
for artist in artists_collection.find():
    name = artist.get("name", "")
    norm = normalize(name)
    if norm and artist.get("normalizedName") != norm:
        artists_collection.update_one(
            {"_id": artist["_id"]},
            {"$set": {"normalizedName": norm}}
        )
        count += 1
print(f"✅ Updated {count} artists")

# ✅ Update albums
count = 0
for album in albums_collection.find():
    title = album.get("title", "")
    norm = normalize(title)
    if norm and album.get("normalizedTitle") != norm:
        albums_collection.update_one(
            {"_id": album["_id"]},
            {"$set": {"normalizedTitle": norm}}
        )
        count += 1
print(f"✅ Updated {count} albums")

print("🎉 normalized fields update done.")
