import apiClient from "./api-client";

export const authService = {
  /**
   * Register a new user
   */
  register: async (payload: Record<string, any>) => {
    const response = await apiClient.post("/auth/register", payload);
    return response.data;
  },

  /**
   * Login credentials verify/fetch
   */
  login: async (payload: Record<string, any>) => {
    const response = await apiClient.post("/auth/login", payload);
    return response.data;
  },

  /**
   * Verify token / Fetch current user info
   */
  getCurrentUser: async () => {
    const response = await apiClient.post("/auth/verify");
    return response.data;
  },

  /**
   * Update profile information
   */
  updateProfile: async (payload: Record<string, any>) => {
    const response = await apiClient.put("/auth/profile", payload);
    return response.data;
  },

  /**
   * Logout user session on backend
   */
  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },
};

export default authService;
