"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, user } = useAuth()

  
  useEffect(() => {
    if (!isAuthenticated) return
    async function fetchNotifications() {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:8000/api/notifications/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()
        console.log("Fetched notifications:", data)
        setNotifications(data || [])
      } catch (err) {
        console.error("Error fetching notifications", err)
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
      // detect role changed
  const roleChanged = localStorage.getItem("roleChanged")
  if (roleChanged) {
    setNotifications((prev) => [
      {
        id: `role-changed-${Date.now()}`,
        message: roleChanged,
        read: false,
        timeAgo: "just now",
        link: "/profile"
      },
      ...prev
    ])
    localStorage.removeItem("roleChanged")
  }
  }, [isAuthenticated, user])

  // Mark as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  // Add real-time notification (nếu có socket)
  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev])
  }

  const removeNotification = (id) => {
  setNotifications((prev) => prev.filter((n) => n.id !== id));
};


  return (
    <NotificationContext.Provider
      value={{ notifications, markAsRead, addNotification, removeNotification, loading }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
