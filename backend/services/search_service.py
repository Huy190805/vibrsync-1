from typing import Dict, List
from bson.regex import Regex
from database.db import songs_collection, artists_collection, albums_collection
import unicodedata
import traceback
from bson import ObjectId


class SearchService:
    @staticmethod
    def _convert_id(doc: dict) -> dict:
        def convert(obj):
            if isinstance(obj, ObjectId):
                return str(obj)
            elif isinstance(obj, list):
                return [convert(item) for item in obj]
            elif isinstance(obj, dict):
                return {k: convert(v) for k, v in obj.items()}
            else:
                return obj

        return convert(doc)

    @staticmethod
    def strip_vietnamese_accents(text: str) -> str:
        return ''.join(
            c for c in unicodedata.normalize('NFD', text)
            if unicodedata.category(c) != 'Mn'
        ).lower()

    @staticmethod
    def search_all(query: str, search_type: str = "all") -> Dict[str, List[dict]]:
        raw_query = query.strip().lower()
        normalized_query = SearchService.strip_vietnamese_accents(raw_query)

        regex = Regex(f".*{raw_query}.*", "i")
        normalized_regex = Regex(f".*{normalized_query}.*", "i")

        results = {
            "songs": [],
            "artists": [],
            "albums": []
        }

        # 🔍 SONGS
        if search_type in ("all", "song"):
            try:
                songs = songs_collection.find({
                    "$or": [
                        {"title": regex},
                        {"normalizedTitle": normalized_regex},
                        {"artist": regex}
                    ]
                }, {
                    "_id": 1, "title": 1, "artist": 1,
                    "coverArt": 1, "cover_art": 1, "cover_image": 1, "cover_url": 1,
                    "duration": 1
                })

                results["songs"] = [
                    {
                        **SearchService._convert_id(s),
                        "cover_art": s.get("coverArt") or s.get("cover_art") or s.get("cover_image") or s.get("cover_url"),
                    }
                    for s in songs
                ]
            except Exception as e:
                print("[❌ SONGS ERROR]", e)
                traceback.print_exc()

        # 🔍 ARTISTS
        if search_type in ("all", "artist"):
            try:
                artists = artists_collection.find({
                    "$or": [
                        {"name": regex},
                        {"normalizedName": normalized_regex}
                    ]
                }, {
                    "_id": 1, "name": 1, "image": 1, "avatar_url": 1
                })
                results["artists"] = [
                    {
                        **SearchService._convert_id(a),
                        "image": a.get("image") or a.get("avatar_url")
                    }
                    for a in artists
                ]
            except Exception as e:
                print("[❌ ARTISTS ERROR]", e)
                traceback.print_exc()

        # 🔍 ALBUMS
        if search_type in ("all", "album"):
            try:
                albums = albums_collection.find({
                    "$or": [
                        {"title": regex},
                        {"normalizedTitle": normalized_regex},
                        {"artist.name": regex}
                    ]
                }, {
                    "_id": 1, "title": 1,
                    "coverArt": 1, "cover_art": 1, "cover_url": 1, "cover_image": 1,
                    "artist": 1, "release_year": 1
                })

                results["albums"] = [
                    {
                        **SearchService._convert_id(a),
                        "cover_art": a.get("coverArt") or a.get("cover_art") or a.get("cover_image") or a.get("cover_url"),
                    }
                    for a in albums
                ]
            except Exception as e:
                print("[❌ ALBUMS ERROR]", e)
                traceback.print_exc()

        return results

    @staticmethod
    def get_trending(limit: int = 5) -> Dict[str, List[dict]]:
        try:
            songs = list(songs_collection.find().sort("play_count", -1).limit(limit))
            artists = list(artists_collection.find().limit(3))
            albums = list(albums_collection.find().limit(3))

            return {
                "songs": [
                    {
                        **SearchService._convert_id(s),
                        "cover_art": s.get("coverArt") or s.get("cover_art") or s.get("cover_image") or s.get("cover_url")
                    }
                    for s in songs
                ],
                "artists": [
                    {
                        **SearchService._convert_id(a),
                        "image": a.get("image") or a.get("avatar_url")
                    }
                    for a in artists
                ],
                "albums": [
                    {
                        **SearchService._convert_id(a),
                        "cover_art": a.get("coverArt") or a.get("cover_art") or a.get("cover_image") or a.get("cover_url")
                    }
                    for a in albums
                ]
            }

        except Exception as e:
            print("[❌ TRENDING ERROR]", e)
            traceback.print_exc()
            return {
                "songs": [],
                "artists": [],
                "albums": []
            }
