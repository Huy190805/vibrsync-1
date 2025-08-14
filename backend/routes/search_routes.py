from fastapi import APIRouter, Query
from services.search_service import SearchService

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("")
async def search_all(query: str = Query("", min_length=0), type: str = "all"):
    print(f"[SEARCH] 🔍 query='{query}', type='{type}'")
    if not query.strip():
        return SearchService.get_trending()
    return SearchService.search_all(query.strip(), type)
