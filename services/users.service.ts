import { User, UserInput, ApiResponse } from "@/types";
import { request } from "./apiClient";

export const usersService = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    return request<User[]>("/users");
  },

  getById: async (id: number): Promise<ApiResponse<User>> => {
    return request<User>(`/users/${id}`);
  },

  create: async (payload: UserInput): Promise<ApiResponse<User>> => {
    return request<User>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (id: number, payload: Partial<UserInput>): Promise<ApiResponse<User>> => {
    return request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    return request<null>(`/users/${id}`, {
      method: "DELETE",
    });
  },
};
