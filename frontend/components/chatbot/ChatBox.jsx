"use client";

import { useState, useEffect, useRef } from "react";
import { X, Trash2 } from "lucide-react";
import styles from "./chatbox.module.css";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


export default function ChatBox({ isOpen, onClose }) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [typingText, setTypingText] = useState("");
  const chatLogRef = useRef(null);

  const getUserId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        return {
          id: userObj._id || userObj.id || null,
          name: userObj.name || "Khách hàng",
        };
      }
    } catch {
      return { id: null, name: "Khách hàng" };
    }
    return { id: null, name: "Khách hàng" };
  };

  const scrollToBottom = () => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      const user = getUserId();
      if (!user.id) {
        setChatHistory([
          {
            text: "❌ Không tìm thấy user_id. Vui lòng đăng nhập lại.",
            sender: "bot",
          },
        ]);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8000/chat/history/${user.id}`);
        const data = await res.json();
        if (res.ok) {
          const history = data.history || [];
          if (history.length === 0) {
            setChatHistory([
              {
                text: `Xin chào ${user.name}, hôm nay bạn thế nào?`,
                sender: "bot",
              },
            ]);
          } else {
            setChatHistory(history);
          }
        } else {
          console.error("Không thể tải lịch sử:", data);
        }
      } catch (err) {
        console.error("Lỗi khi lấy lịch sử:", err);
      }
    };

    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isBotTyping, typingText]);

  const simulateTyping = (text) => {
    setTypingText("");
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setTypingText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        setChatHistory((prev) => [...prev, { text, sender: "bot" }]);
        setTypingText("");
        setIsBotTyping(false);
      }
    }, 30);
  };

  const handleSend = async (e) => {
    if (e.type === "click" || (e.key === "Enter" && message.trim())) {
      e.preventDefault();
      const trimmed = message.trim();
      if (!trimmed) return;

      const user = getUserId();
      if (!user.id) {
        setChatHistory((prev) => [
          ...prev,
          {
            text: "❌ Không tìm thấy user_id. Vui lòng đăng nhập lại.",
            sender: "bot",
          },
        ]);
        return;
      }

      const userMsg = { text: trimmed, sender: "user" };
      setChatHistory((prev) => [...prev, userMsg]);
      setMessage("");
      setIsBotTyping(true);

      try {
        const res = await fetch("http://localhost:8000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, user_id: user.id }),
        });

        const data = await res.json();

        if (res.ok && data.response) {
          simulateTyping(data.response);
        } else {
          simulateTyping("🤖 Không có phản hồi từ AI.");
        }
      } catch (err) {
        console.error("Lỗi gửi tin nhắn:", err);
        simulateTyping("❌ Lỗi khi gửi yêu cầu đến máy chủ.");
      }
    }
  };

  useEffect(() => {
    const keyHandler = (e) => {
      if (e.key === "Enter" && isOpen) {
        handleSend(e);
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [message, isOpen]);

  const handleClearHistory = async () => {
    const user = getUserId();
    if (user.id) {
      try {
        await fetch(`http://localhost:8000/chat/history/${user.id}`, {
          method: "DELETE",
        });
        setChatHistory([]);
      } catch (err) {
        console.error("Lỗi khi xoá lịch sử:", err);
      }
    }
  };


  // code mới gửi kèm ảnh
  const renderMessageText = (text) => {
  const markdownImageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
  const markdownLinkRegex = /\[([^\]]+)\]\((\/[^\s)]+|https?:\/\/[^\s)]+)\)/g;


  const elements = [];
  let lastIndex = 0;

  // Kết hợp xử lý cả ảnh và link bằng cách gom chung lại theo vị trí xuất hiện
  const matches = [...text.matchAll(markdownImageRegex), ...text.matchAll(markdownLinkRegex)]
    .map((match) => ({ ...match, index: match.index }))
    .sort((a, b) => a.index - b.index);

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const start = match.index;

    if (start > lastIndex) {
      elements.push(<span key={lastIndex}>{text.slice(lastIndex, start)}</span>);
    }

    if (match[0].startsWith("!")) {
      // Ảnh markdown
      const alt = match[1];
      const src = match[2];
      elements.push(
        <img
          key={start}
          src={src}
          alt={alt}
          style={{ maxWidth: "100%", borderRadius: "12px", margin: "10px 0" }}
        />
      );
    } else {
      // Link markdown
      const label = match[1];
      const url = match[2];
      const isInternal = url.startsWith("http://localhost:3000") || url.startsWith("https://yourdomain.com");
      const href = isInternal
        ? url.replace("http://localhost:3000", "").replace("https://yourdomain.com", "")
        : url;

      elements.push(
        isInternal ? (
          <Link key={start} href={href} className={styles.linkButton}>
            {label}
          </Link>
        ) : (
          <a
            key={start}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkButton}
          >
            {label}
          </a>
        )
      );
    }

    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) {
    elements.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
  }

  return elements;
};


  if (!isOpen) return null;

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <span className="font-bold">MUSIC AI</span>
        <div className="flex items-center gap-2">
          <button onClick={handleClearHistory} title="Xoá lịch sử">
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className={styles.chatLog} ref={chatLogRef}>
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`${styles.messageWrapper} ${
              chat.sender === "user" ? styles.messageUserWrapper : styles.messageBotWrapper
            }`}
          >
            <img
              src={chat.sender === "user" ? "/User.jpg" : "/ChatBot.jpg"}
              alt={chat.sender === "user" ? "User Avatar" : "Bot Avatar"}
              className={styles.avatar}
            />

            <div
              className={`${styles.message} ${
                chat.sender === "user" ? styles.messageUser : styles.messageBot
              }`}
            >
              {chat.sender === "bot" ? renderMessageText(chat.text) : chat.text}
            </div>
          </div>
        ))}

        {isBotTyping && typingText && (
          <div className={`${styles.messageWrapper} ${styles.messageBotWrapper}`}>
            <img src="/robot.jpg" alt="Bot Avatar" className={styles.avatar} />
            <div className={`${styles.message} ${styles.messageBot}`}>
              {renderMessageText(typingText)}<span className={styles.cursor}>|</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.chatInput}>
        <input
          type="text"
          value={message}
          placeholder="Nhập nội dung..."
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSend}>Gửi</button>
      </div>
    </div>
  );
}