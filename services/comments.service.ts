import { Comment, CommentInput, ApiResponse } from "@/types";
import { request } from "./apiClient";

export const commentsService = {
  getByPostId: async (postId: number): Promise<ApiResponse<Comment[]>> => {
    return request<Comment[]>(`/comments/post/${postId}`);
  },

  create: async (postId: number, payload: CommentInput): Promise<ApiResponse<Comment>> => {
    return request<Comment>(`/comments/post/${postId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (id: number, message: string): Promise<ApiResponse<Comment>> => {
    return request<Comment>(`/comments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ message }),
    });
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    return request<null>(`/comments/${id}`, {
      method: "DELETE",
    });
  },
};
