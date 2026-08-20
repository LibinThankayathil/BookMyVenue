import { Request, Response, NextFunction } from 'express';
import { VenueService } from '../services/venue.service';

export class AdminController {
  private venueService: VenueService;

  constructor() {
    this.venueService = new VenueService();
  }

  /**
   * GET /admin/venues
   * Returns all venues for admin (all statuses).
   */
  getAllVenues = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const venues = await this.venueService.getAllVenuesForAdmin();
      return res.status(200).json({ success: true, data: venues });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /admin/venues/pending
   * Returns all venues awaiting admin review.
   */
  getPendingVenues = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const venues = await this.venueService.getPendingVenues();
      return res.status(200).json({ success: true, data: venues });
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH /admin/venues/:id/approve
   * Approves a pending venue.
   */
  approveVenue = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const venueId = req.params.id as string;
      if (!venueId) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid venue ID format.' });
      }

      const venue = await this.venueService.approveVenue(venueId);
      return res.status(200).json({
        success: true,
        message: 'Venue approved successfully.',
        data: venue,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH /admin/venues/:id/reject
   * Rejects a pending venue.
   */
  rejectVenue = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const venueId = req.params.id as string;
      if (!venueId) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid venue ID format.' });
      }

      const venue = await this.venueService.rejectVenue(venueId);
      return res.status(200).json({
        success: true,
        message: 'Venue rejected.',
        data: venue,
      });
    } catch (err) {
      next(err);
    }
  };
}
