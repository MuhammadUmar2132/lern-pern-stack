import { Item, ItemInput, ApiResponse } from "@/types";
import { request, uploadFile } from "./apiClient";

export const itemsService = {
  getAll: async (): Promise<ApiResponse<Item[]>> => {
    return request<Item[]>("/items");
  },

  getById: async (id: number): Promise<ApiResponse<Item>> => {
    return request<Item>(`/items/${id}`);
  },

  create: async (payload: ItemInput): Promise<ApiResponse<Item>> => {
    return request<Item>("/items", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (id: number, payload: Partial<ItemInput>): Promise<ApiResponse<Item>> => {
    return request<Item>(`/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    return request<null>(`/items/${id}`, {
      method: "DELETE",
    });
  },

  uploadImage: async (file: File) => {
    return uploadFile("/items/upload", file);
  },
};
