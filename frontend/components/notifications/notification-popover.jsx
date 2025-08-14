import { useNotifications } from "@/context/notification-context";
import { motion } from "framer-motion";
import { Trash } from "lucide-react";
import Link from "next/link";

function formatVNTime(isoString) {
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
export default function NotificationPopover({ onClose }) {
  const { notifications, markAsRead, addNotification, removeNotification } = useNotifications();

const handleDelete = async (id) => {
  if (!id) return; // nếu id chưa xác định thì bỏ qua
  if (typeof id === "string" && id.startsWith("role-changed-")) {
    removeNotification(id);  // chỉ remove local
    return;
  }
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:8000/api/notifications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete notification");
    removeNotification(id);
  } catch (err) {
    console.error(err);
    alert("Delete notification failed!");
  }
};

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute right-4 top-16 w-72 bg-gray-900 rounded-lg shadow-lg z-50"
    >
      <div className="p-2 border-b border-gray-700 text-gray-300 font-bold">
        Notifications
      </div>
<ul className="divide-y divide-gray-700 max-h-80 overflow-y-auto scroll-container">
  {notifications.length === 0 && (
    <li className="p-3 text-sm text-gray-400">No notifications</li>
  )}
  {notifications.map((n, index) => (
    <li
      key={n.id || `notif-${index}`}
      className={`p-3 hover:bg-gray-800 text-sm ${
        n.read ? "opacity-60" : ""
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="font-bold mr-2">{index + 1}.</span>

        {n.type === "artist_request" ? (
          <Link
            href="/admin/artist-requests"
            className="flex-1 text-purple-400 hover:underline"
            onClick={() => markAsRead(n.id)}
          >
            {n.message}
          </Link>
        ) : (
          <span className="flex-1">{n.message}</span>
        )}

        {!n.read && (
          <span className="ml-2 text-green-400" title="Unread">●</span>
        )}
      </div>
      <div className="text-xs text-gray-500">
        {n.created_at ? formatVNTime(n.created_at): ""}
      </div>
      <div className="flex gap-2 mt-1">
        {!n.read && (
          <button
            onClick={() => markAsRead(n.id)}
            className="text-purple-400 text-xs hover:text-purple-600"
          >
            Mark as read
          </button>
        )}
        <button
          onClick={() => handleDelete(n.id)}
          className="text-red-500 hover:text-red-600"
        >
          <Trash size={14} />
        </button>
      </div>
    </li>
    ))}
    </ul>
      <button
        className="w-full p-2 text-xs text-center text-purple-400 hover:bg-gray-800"
        onClick={onClose}
      >
        Close
      </button>
    </motion.div>
  );
}
