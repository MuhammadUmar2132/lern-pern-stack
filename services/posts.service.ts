import { Post, PostInput, ApiResponse } from "@/types";
import { request, uploadFile } from "./apiClient";

export const postsService = {
  getAll: async (): Promise<ApiResponse<Post[]>> => {
    return request<Post[]>("/posts");
  },

  getById: async (id: number): Promise<ApiResponse<Post>> => {
    return request<Post>(`/posts/${id}`);
  },

  getByUserId: async (userId: number): Promise<ApiResponse<Post[]>> => {
    return request<Post[]>(`/posts/user/${userId}`);
  },

  create: async (payload: PostInput): Promise<ApiResponse<Post>> => {
    return request<Post>("/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (id: number, payload: Partial<PostInput>): Promise<ApiResponse<Post>> => {
    return request<Post>(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    return request<null>(`/posts/${id}`, {
      method: "DELETE",
    });
  },

  uploadImage: async (file: File) => {
    return uploadFile("/posts/upload", file);
  },
};
