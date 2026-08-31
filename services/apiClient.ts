import { ApiResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
}

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, ...customConfig } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customConfig.headers,
  };

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      try {
        const errJson = await response.json();
        return {
          success: false,
          message: errJson.message || `Request failed with status ${response.status}`,
        };
      } catch {
        return {
          success: false,
          message: `Request failed with status ${response.status} (${response.statusText})`,
        };
      }
    }
    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error occurred";
    return {
      success: false,
      message,
    };
  }
}

export async function uploadFile(
  endpoint: string,
  file: File,
  fieldName = "image"
): Promise<ApiResponse<{ url: string; publicId: string }>> {
  const formData = new FormData();
  formData.append(fieldName, file);

  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return {
      success: false,
      message,
    };
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const baseUrl = BASE_URL.replace(/\/api\/?$/, "");
    const response = await fetch(`${baseUrl}/`, { method: "GET" });
    return response.ok;
  } catch {
    return false;
  }
}
