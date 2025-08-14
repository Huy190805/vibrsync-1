"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Moon, Sun, Palette, Bell, Globe, Save, X } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("appearance");
  const [settings, setSettings] = useState({
    theme: "dark",
    font: "Inter",
    fontSize: "medium",
    sidebarWidth: "normal",
    notifications: { login: true, newSongs: true },
    language: "en",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load current settings from localStorage or default
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }
    const savedSettings = localStorage.getItem("settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [isAuthenticated, router]);

  // Sync with current UI state if needed
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const currentFontSize = getComputedStyle(document.documentElement).fontSize || "medium";
    const currentSidebarWidth = localStorage.getItem("sidebarWidth") || "normal";
    setSettings((prev) => ({
      ...prev,
      theme: currentTheme,
      fontSize: currentFontSize.replace("px", "") === "16" ? "medium" : currentFontSize,
      sidebarWidth: currentSidebarWidth,
    }));
  }, []);

  // Handle settings change
  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Save settings to server and localStorage
  const saveSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/user/settings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setMessage("Settings saved successfully!");
        localStorage.setItem("settings", JSON.stringify(settings));
        document.documentElement.setAttribute("data-theme", settings.theme);
        setTimeout(() => setMessage(""), 3000);
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (err) {
      setMessage("Error saving settings: " + err.message);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/10 to-black p-6">
      <div className="max-w-4xl mx-auto bg-white/5 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === "appearance" ? "text-purple-500 border-b-2 border-purple-500" : "text-gray-400"}`}
            onClick={() => setActiveTab("appearance")}
          >
            Appearance
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === "notifications" ? "text-purple-500 border-b-2 border-purple-500" : "text-gray-400"}`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === "language" ? "text-purple-500 border-b-2 border-purple-500" : "text-gray-400"}`}
            onClick={() => setActiveTab("language")}
          >
            Language
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "appearance" && (
            <div className="space-y-4">
              <div>
                <label className="text-white font-medium flex items-center gap-2">
                  <Palette size={18} /> Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleChange("theme", e.target.value)}
                  className="mt-2 w-full bg-white/10 border border-white/10 rounded-md p-2 text-white"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="text-white font-medium flex items-center gap-2">
                  <Palette size={18} /> Font Size
                </label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => handleChange("fontSize", e.target.value)}
                  className="mt-2 w-full bg-white/10 border border-white/10 rounded-md p-2 text-white"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div>
                <label className="text-white font-medium flex items-center gap-2">
                  <Palette size={18} /> Sidebar Width
                </label>
                <select
                  value={settings.sidebarWidth}
                  onChange={(e) => handleChange("sidebarWidth", e.target.value)}
                  className="mt-2 w-full bg-white/10 border border-white/10 rounded-md p-2 text-white"
                >
                  <option value="normal">Normal</option>
                  <option value="narrow">Narrow</option>
                  <option value="wide">Wide</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={settings.notifications.login}
                  onChange={(e) => handleChange("notifications", { ...settings.notifications, login: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-white/10 rounded"
                />
                <Bell size={18} /> Login Notifications
              </label>
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={settings.notifications.newSongs}
                  onChange={(e) => handleChange("notifications", { ...settings.notifications, newSongs: e.target.checked })}
                  className="w-4 h-4 text-purple-600 bg-white/10 rounded"
                />
                <Bell size={18} /> New Song Notifications
              </label>
            </div>
          )}

          {activeTab === "language" && (
            <div>
              <label className="text-white font-medium flex items-center gap-2">
                <Globe size={18} /> Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleChange("language", e.target.value)}
                className="mt-2 w-full bg-white/10 border border-white/10 rounded-md p-2 text-white"
              >
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
              </select>
            </div>
          )}
        </div>

        {/* Save Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={saveSettings}
                disabled={loading}
                className={`mt-6 px-4 py-2 bg-purple-600 text-white rounded-full flex items-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"}`}
              >
                <Save size={18} /> Save Settings
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save your settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Feedback Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-md ${message.includes("Error") ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}