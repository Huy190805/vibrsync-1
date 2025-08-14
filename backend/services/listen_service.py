from models.listen_song import ListenSongRequest
from database.repositories.listen_repository import ListenRepository

class ListenService:
    def __init__(self):
        self.repo = ListenRepository()

    def record_listen(self, data: ListenSongRequest):
        self.repo.record_listen(
            user_id=data.user_id,
            song_id=data.song_id,
            listened_at=data.listened_at,
            type=data.type,
        )

    def get_repeat_count(self, user_id: str, song_id: str):
        return self.repo.get_repeat_count(user_id, song_id)
    

