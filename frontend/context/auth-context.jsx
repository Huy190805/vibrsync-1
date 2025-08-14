"use client";
//auth-context.jsx

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifyToken(token).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

const verifyToken = async (token) => {
  try {
    setLoading(true);
    const response = await fetch("http://localhost:8000/user/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (!response.ok) throw new Error("Invalid or expired token");

    setUser(data);
    setIsAuthenticated(true);
    return data;
  } catch (err) {
    console.warn("🔒 Token verification failed:", err.message);
    throw err;
  } finally {
    setLoading(false);
  }
};

const refreshUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch("http://localhost:8000/user/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    if (!response.ok) throw new Error("Failed to refresh user");

    setUser(data);
    setIsAuthenticated(true);

    // ✅ Thêm dòng này để OAuth redirect hoạt động đúng
    localStorage.setItem("previousRole", data.role);
  } catch (err) {
    console.error("🔄 Failed to refresh user:", err.message);
  }
};

const signIn = async (email, password) => {
  try {
    setLoading(true);
    const response = await fetch("http://localhost:8000/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Invalid credentials");

    const userData = data.user;
    if (userData.banned) throw new Error("Account is banned");

    // ✅ Gán trực tiếp user và token
    localStorage.setItem("token", data.access_token);
    setUser(userData);
    setIsAuthenticated(true);

    localStorage.setItem("welcomeNotification", `Welcome back, ${userData.name}! You are logged in as ${userData.role}.`);
    localStorage.setItem("previousRole", userData.role);

    // 📨 Gửi thông báo login (không block UI)
    fetch("http://localhost:8000/api/notifications", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: userData.id,
        title: "Welcome",
        message: `Welcome back, ${userData.name}! You are logged in as ${userData.role}.`,
        type: "login"
      })
    }).catch(console.warn);

    // ✅ Điều hướng mượt mà theo role
    router.push(
      userData.role === "admin"
        ? "/admin/dashboard"
        : userData.role === "artist"
          ? "/role_artist/dashboard"
          : "/"
    );
  } catch (err) {
    console.error("❌ Sign-in error:", err.message);
    throw err;
  } finally {
    setLoading(false);
  }
};


  const signUp = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        router.push("/signin");
      } else {
        throw new Error(data.detail || "Failed to create account");
      }
    } catch (err) {
      console.error("❌ Sign-up error:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    router.push("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading,refreshUser, signIn, signUp, signOut,verifyToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
