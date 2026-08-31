"use client";

import { useState, useEffect } from "react";

interface FormattedDateProps {
  dateString?: string;
  type?: "date" | "time" | "datetime";
  fallback?: string;
}

export function FormattedDate({
  dateString,
  type = "date",
  fallback = "",
}: FormattedDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!dateString) return <span>{fallback}</span>;
  if (!mounted) return <span suppressHydrationWarning>{fallback}</span>;

  const date = new Date(dateString);
  let text = "";

  if (type === "date") {
    text = date.toLocaleDateString();
  } else if (type === "time") {
    text = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else {
    text = date.toLocaleString([], {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  return <span suppressHydrationWarning>{text}</span>;
}
