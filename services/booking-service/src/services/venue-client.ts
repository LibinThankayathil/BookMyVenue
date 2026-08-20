import { env } from '../config/env';
import { Venue, VenueClosure } from '../dtos/venue-service.dto';

export class VenueClient {
  private static baseUrl = env.VENUE_SERVICE_URL;

  /**
   * Fetches venue details by venue ID.
   * Public endpoint, no authorization headers required.
   */
  static async getVenue(id: number): Promise<Venue | null> {
    try {
      const url = `${this.baseUrl}/venues/${id}`;
      const response = await fetch(url);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(
          `Venue service returned status ${response.status} for venue ${id}`,
        );
      }

      const body = (await response.json()) as { success: boolean; data: Venue };
      return body.success ? body.data : null;
    } catch (err) {
      console.error(`Error querying venue service for venue ${id}:`, err);
      throw new Error(
        'Failed to retrieve venue details from external service.',
        { cause: err },
      );
    }
  }

  /**
   * Fetches closures list for a given venue.
   * Endpoint is protected by requireOwner middleware; passes owner context headers.
   */
  static async getVenueClosures(
    venueId: number,
    ownerId: number,
  ): Promise<VenueClosure[]> {
    try {
      const url = `${this.baseUrl}/venues/${venueId}/closures`;
      const response = await fetch(url, {
        headers: {
          'x-user-id': ownerId.toString(),
          'x-user-roles': 'OWNER',
        },
      });

      if (response.status === 404) {
        return [];
      }

      if (!response.ok) {
        throw new Error(
          `Venue service returned status ${response.status} for closures of venue ${venueId}`,
        );
      }

      const body = (await response.json()) as {
        success: boolean;
        data: VenueClosure[];
      };
      return body.success ? body.data : [];
    } catch (err) {
      console.error(`Error querying venue closures for venue ${venueId}:`, err);
      throw new Error(
        'Failed to retrieve venue closures from external service.',
        { cause: err },
      );
    }
  }
}
