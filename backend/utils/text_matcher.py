from difflib import get_close_matches

def fuzzy_match_artist_name(input_name: str, artist_names: list, cutoff=0.75):
    matches = get_close_matches(input_name, artist_names, n=1, cutoff=cutoff)
    return matches[0] if matches else None
