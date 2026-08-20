import apiClient from "./api-client";

export const venueService = {
  /**
   * Fetch all venues with optional filters
   */
  getVenues: async (params?: Record<string, any>) => {
    const response = await apiClient.get("/venues", { params });
    return response.data;
  },

  /**
   * Fetch a single venue by ID
   */
  getVenueById: async (id: string) => {
    const response = await apiClient.get(`/venues/${id}`);
    return response.data;
  },

  /**
   * Create a new venue (Owner/Admin only)
   */
  createVenue: async (payload: Record<string, any>) => {
    const response = await apiClient.post("/venues", payload);
    return response.data;
  },

  /**
   * Update an existing venue (Owner/Admin only)
   */
  updateVenue: async (id: string, payload: Record<string, any>) => {
    const response = await apiClient.put(`/venues/${id}`, payload);
    return response.data;
  },

  /**
   * Delete a venue (Owner/Admin only)
   */
  deleteVenue: async (id: string) => {
    const response = await apiClient.delete(`/venues/${id}`);
    return response.data;
  },
};

export default venueService;
