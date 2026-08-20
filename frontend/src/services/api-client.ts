import axios from "axios";
import { toast } from "sonner";
import { getSession } from "next-auth/react";
import { getApiBaseUrl } from "@/lib/api/config";

export const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor: Automatically retrieve token from NextAuth session and add to header
apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined" && config.headers && !config.headers["Authorization"]) {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers["Authorization"] = `Bearer ${session.accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle API errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

// Error Handling Function
export const handleApiError = (error: any) => {
  let errorMessage = "An unexpected error occurred";

  if (error.response) {
    switch (error.response.status) {
      case 400:
        if (Array.isArray(error.response.data?.message)) {
          errorMessage = error.response.data.message.join(", ");
        } else {
          errorMessage = error.response.data?.message ?? "Invalid request";
        }
        break;
      case 401:
        errorMessage = "Unauthorized. Please log in again.";
        break;
      case 403:
        errorMessage = "You do not have permission to perform this action.";
        break;
      case 404:
        errorMessage = "The requested resource was not found.";
        break;
      case 409:
        errorMessage = error.response.data?.message ?? "Conflict error. Resource potentially already exists or is occupied.";
        break;
      case 422:
        errorMessage = error.response.data?.message ?? "Validation error";
        break;
      case 500:
        errorMessage = "Server error. Please try again later.";
        break;
      default:
        errorMessage = error.response.data?.message ?? "Something went wrong.";
    }
  } else if (error.request) {
    errorMessage =
      "No response from server. Check your internet connection or server status.";
  } else {
    errorMessage = error.message || "Request setup failed.";
  }

  if (typeof window !== "undefined") {
    toast.error("Error", {
      description: errorMessage,
    });
  } else {
    console.error("API Client Server Error:", errorMessage);
  }
};

export default apiClient;
