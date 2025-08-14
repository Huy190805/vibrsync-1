export function formatVNTime(isoString) {
  const date = new Date(isoString);
  date.setHours(date.getHours() + 7); // GMT+7
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2,"0");
  const day = String(date.getDate()).padStart(2,"0");
  const hour = String(date.getHours()).padStart(2,"0");
  const minute = String(date.getMinutes()).padStart(2,"0");
  const second = String(date.getSeconds()).padStart(2,"0");
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
