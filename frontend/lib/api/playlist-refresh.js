let refreshFn = null;

export function setPlaylistRefreshFunction(fn) {
  refreshFn = fn;
}

export function triggerPlaylistRefresh() {
  if (typeof refreshFn === "function") {
    refreshFn();
  }
}