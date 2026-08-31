export interface Item {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ItemInput {
  title: string;
  description?: string;
  imageUrl?: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface UserInput {
  name: string;
  email: string;
  password?: string;
}

export interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string | null;
  image_url: string | null;
  created_at?: string;
}

export interface PostInput {
  userId: number;
  title: string;
  content?: string;
  imageUrl?: string | null;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  message: string;
  created_at?: string;
}

export interface CommentInput {
  userId: number;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export type TabType = "items" | "posts" | "users";

export interface ToastNotification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
