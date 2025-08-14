"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomAlert({ open, type = "info", title, message, onConfirm, onCancel }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`bg-purple-800 text-white rounded-lg shadow-lg p-6 max-w-sm w-full border-2 ${
              type === "error"
                ? "border-red-400"
                : type === "success"
                ? "border-green-400"
                : "border-purple-500"
            }`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-gray-200 mb-4">{message}</p>
            <div className="flex justify-end gap-2">
              {onCancel && (
                <button
                  className="px-4 py-1 rounded bg-gray-600 hover:bg-gray-500"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              )}
              <button
                className="px-4 py-1 rounded bg-purple-600 hover:bg-purple-500"
                onClick={onConfirm}
              >
                OK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
