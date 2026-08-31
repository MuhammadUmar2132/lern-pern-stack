"use client";

import { ToastNotification } from "@/types";

interface NotificationToastProps {
  notification: ToastNotification | null;
  onClose?: () => void;
}

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  if (!notification) return null;

  const bgStyles = {
    success: "bg-emerald-950/90 border-emerald-500/50 text-emerald-200",
    error: "bg-rose-950/90 border-rose-500/50 text-rose-200",
    info: "bg-indigo-950/90 border-indigo-500/50 text-indigo-200",
  }[notification.type];

  const icon = {
    success: "✓",
    error: "⚠",
    info: "ℹ",
  }[notification.type];

  return (
    <div className="fixed top-5 right-5 z-50 animate-bounce">
      <div
        className={`px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-3 backdrop-blur-md ${bgStyles}`}
      >
        <span className="font-bold">{icon}</span>
        <span>{notification.message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-xs opacity-70 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
