"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, UserMinus, UserPlus, User, Trash2, UserX, UserCheck, Search, AlertCircle, CheckCircle } from "lucide-react";

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [isAlertClicked, setIsAlertClicked] = useState(false);

  // Custom alert component
  const CustomAlert = ({ message, isError = false, onClose }) => (
    <motion.div
      initial={{ opacity: 0, y: -100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -100, scale: 0.8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed top-8 left-1/2 transform -translate-x-1/2 max-w-lg w-11/12 p-6 rounded-2xl shadow-2xl z-[1000] flex items-center gap-4 ${
        isError ? "bg-gradient-to-r from-red-700 to-red-900" : "bg-gradient-to-r from-teal-600 to-teal-800"
      } ${isAlertClicked ? "" : "backdrop-blur-lg"} text-white border-2 border-white/30`}
      style={{ boxShadow: "0 0 20px rgba(255, 255, 255, 0.2)" }}
      onClick={() => setIsAlertClicked(true)}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        {isError ? (
          <AlertCircle className="w-8 h-8 text-red-200" />
        ) : (
          <CheckCircle className="w-8 h-8 text-teal-200" />
        )}
      </motion.div>
      <div className="flex-1">
        <p className="text-base font-semibold">{message}</p>
        <motion.div
          className={`h-1.5 mt-3 rounded-full ${
            isError ? "bg-gradient-to-r from-red-300 to-red-500" : "bg-gradient-to-r from-teal-300 to-teal-500"
          }`}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 3, ease: "linear" }}
        />
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering the parent onClick
          setIsAlertClicked(false); // Reset blur state on close
          onClose();
        }}
        className="p-2 hover:bg-white/20 rounded-full transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );

  // Custom confirmation modal
  const ConfirmModal = ({ message, onConfirm, onCancel }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center z-[1000]"
    >
      <motion.div
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20"
        style={{ boxShadow: "0 0 20px rgba(255, 255, 255, 0.2)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-8 h-8 text-teal-400" />
          <h2 className="text-xl font-bold text-white">Confirm Action</h2>
        </div>
        <p className="text-white mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Confirm
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  // Show custom alert with console logging
  const showAlert = (message, isError = false) => {
    console.log("Alert triggered:", { message, isError });
    setAlert({ message, isError });
    setIsAlertClicked(false); // Reset blur state when showing new alert
    setTimeout(() => setAlert(null), 3000);
  };

  // Show confirmation modal
  const showConfirm = (message, onConfirm) => {
    setConfirm({ message, onConfirm });
  };

  // Fetch users when component mounts
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/user/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
          setFilteredUsers(data);
        } else {
          throw new Error("Failed to fetch users");
        }
      } catch (err) {
        showAlert(`Error: ${err.message}`, true);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  // Handle search and sorting
  useEffect(() => {
    const filtered = users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const rolePriority = { admin: 1, artist: 2, user: 3 };
        return rolePriority[a.role] - rolePriority[b.role];
      });
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Handle promote to admin
  const handlePromoteToAdmin = async (userId, userName) => {
    showConfirm(
      `Are you sure you want to promote ${userName} to admin? This will grant them full administrative privileges.`,
      async () => {
        const token = localStorage.getItem("token");
        try {
          const response = await fetch(`http://localhost:8000/user/users/${userId}/promote`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (response.ok) {
            setUsers(users.map((u) => (u.id === userId ? { ...u, role: "admin" } : u)));
            showAlert(`${userName} has been promoted to admin.`);
          } else {
            throw new Error(data.detail || "Failed to promote user");
          }
        } catch (err) {
          showAlert(`Error: ${err.message}`, true);
        } finally {
          setConfirm(null);
        }
      }
    );
  };

  // Handle demote artist
  const handleDemoteArtistToUser = async (userId, userName) => {
    showConfirm(
      `Are you sure you want to demote artist ${userName} to user?`,
      async () => {
        const token = localStorage.getItem("token");
        try {
          const response = await fetch(`http://localhost:8000/user/users/${userId}/demote-artist`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (response.ok) {
            setUsers(users.map((u) => (u.id === userId ? { ...u, role: "user" } : u)));
            showAlert(`${userName} has been demoted to user.`);
          } else {
            throw new Error(data.detail || "Failed to demote artist");
          }
        } catch (err) {
          showAlert(`Error: ${err.message}`, true);
        } finally {
          setConfirm(null);
        }
      }
    );
  };

  // Handle delete user
  const handleDeleteUser = async (userId, userName) => {
    showConfirm(
      `Are you sure you want to permanently delete the account of ${userName}?`,
      async () => {
        const token = localStorage.getItem("token");
        try {
          const response = await fetch(`http://localhost:8000/user/users/${userId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (response.ok) {
            setUsers(users.filter((u) => u.id !== userId));
            showAlert(`${userName} has been deleted.`);
          } else {
            throw new Error(data.detail || "Failed to delete user");
          }
        } catch (err) {
          showAlert(`Error: ${err.message}`, true);
        } finally {
          setConfirm(null);
        }
      }
    );
  };

  // Handle demote to user
  const handleDemoteToUser = async (userId, userName) => {
    showConfirm(
      `Are you sure you want to demote ${userName} to user? This will revoke their administrative privileges.`,
      async () => {
        const token = localStorage.getItem("token");
        try {
          const response = await fetch(`http://localhost:8000/user/users/${userId}/demote`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (response.ok) {
            setUsers(users.map((u) => (u.id === userId ? { ...u, role: "user" } : u)));
            showAlert(`${userName} has been demoted to user.`);
          } else {
            throw new Error(data.detail || "Failed to demote user");
          }
        } catch (err) {
          showAlert(`Error: ${err.message}`, true);
        } finally {
          setConfirm(null);
        }
      }
    );
  };

  // Handle ban user
  const handleBanUser = async (userId, userName) => {
    showConfirm(
      `Are you sure you want to ban ${userName}? This will prevent them from accessing the system.`,
      async () => {
        const token = localStorage.getItem("token");
        try {
          const response = await fetch(`http://localhost:8000/user/users/${userId}/ban`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (response.ok) {
            setUsers(users.map((u) => (u.id === userId ? { ...u, banned: true } : u)));
            showAlert(`${userName} has been banned.`);
          } else {
            throw new Error(data.detail || "Failed to ban user");
          }
        } catch (err) {
          showAlert(`Error: ${err.message}`, true);
        } finally {
          setConfirm(null);
        }
      }
    );
  };

  // Handle unban user
  const handleUnbanUser = async (userId, userName) => {
    showConfirm(
      `Are you sure you want to unban ${userName}? This will restore their access to the system.`,
      async () => {
        const token = localStorage.getItem("token");
        try {
          const response = await fetch(`http://localhost:8000/user/users/${userId}/unban`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (response.ok) {
            setUsers(users.map((u) => (u.id === userId ? { ...u, banned: false } : u)));
            showAlert(`${userName} has been unbanned.`);
          } else {
            throw new Error(data.detail || "Failed to unban user");
          }
        } catch (err) {
          showAlert(`Error: ${err.message}`, true);
        } finally {
          setConfirm(null);
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-teal-400 border-gray-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 md:p-8 lg:p-10">
      <AnimatePresence>
        {alert && (
          <CustomAlert
            message={alert.message}
            isError={alert.isError}
            onClose={() => setAlert(null)}
          />
        )}
        {confirm && (
          <ConfirmModal
            message={confirm.message}
            onConfirm={confirm.onConfirm}
            onCancel={() => setConfirm(null)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-teal-400" />
          <h1 className="text-3xl md:text-4xl font-bold">Manage Users</h1>
        </div>
        <div className="text-sm bg-gray-700/50 px-4 py-2 rounded-lg">
          Total Users: <span className="font-semibold text-teal-400">{users.length}</span>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-teal-400 focus:outline-none transition-colors"
          />
        </div>
      </motion.div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-gray-800/30 rounded-lg shadow-lg">
          <thead>
            <tr className="border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700/50">
              <th className="py-4 px-6 text-center text-sm font-medium text-gray-300">No.</th>
              <th className="py-4 px-6 text-left text-sm font-medium text-gray-300">Name</th>
              <th className="py-4 px-6 text-left text-sm font-medium text-gray-300">Email</th>
              <th className="py-4 px-6 text-left text-sm font-medium text-gray-300">Role</th>
              <th className="py-4 px-6 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="py-4 px-6 text-left text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-4 px-6 text-center text-teal-400 font-medium">{index + 1}.</td>
                  <td className="py-4 px-6 text-teal-300 font-medium">{user.name}</td>
                  <td className="py-4 px-6 text-gray-400">{user.email}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-green-500/20 text-green-400"
                          : user.role === "artist"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`text-sm ${
                        user.banned ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {user.banned ? "Banned" : "Active"}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    {user.role === "admin" ? (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDemoteToUser(user.id, user.name)}
                        className="p-2 bg-amber-500 text-black rounded-full hover:bg-amber-600 transition-colors"
                        title="Demote to User"
                      >
                        <UserMinus className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePromoteToAdmin(user.id, user.name)}
                        className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
                        title="Promote to Admin"
                      >
                        <UserPlus className="w-4 h-4" />
                      </motion.button>
                    )}
                    {user.role === "artist" && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDemoteArtistToUser(user.id, user.name)}
                        className="p-2 bg-violet-500 text-white rounded-full hover:bg-violet-600 transition-colors"
                        title="Demote Artist"
                      >
                        <User className="w-4 h-4" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                    {user.banned ? (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleUnbanUser(user.id, user.name)}
                        className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
                        title="Unban User"
                      >
                        <UserCheck className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleBanUser(user.id, user.name)}
                        className="p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                        title="Ban User"
                      >
                        <UserX className="w-4 h-4" />
                      </motion.button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}