import { Request, Response, NextFunction } from 'express';
import { VenueService } from '../services/venue.service';
import {
  CreateVenueDto,
  UpdateVenueDto,
  CreateClosureDto,
  UpdateClosureDto,
} from '../dtos/venue.dto';

export class VenueController {
  private venueService: VenueService;

  constructor() {
    this.venueService = new VenueService();
  }

  /**
   * GET /venues
   * Returns all approved venues.
   */
  getAllVenues = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const venues = await this.venueService.getAllVenues();

      res.status(200).json({
        success: true,
        data: venues,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /venues/amenities
   * Returns all amenities available.
   */
  getAllAmenities = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const amenities = await this.venueService.getAllAmenities();
      res.status(200).json({
        success: true,
        data: amenities,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /venues/:id
   * Returns a specific venue by ID.
   */
  getVenueById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const venueId = req.params.id as string;
      if (!venueId) {
        res
          .status(400)
          .json({ success: false, message: 'Invalid venue ID format' });
        return;
      }

      const venue = await this.venueService.getVenueById(venueId);

      if (!venue) {
        res.status(404).json({ success: false, message: 'Venue not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: venue,
      });
    } catch (err) {
      next(err);
    }
  };

  getMyVenues = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const ownerId = req.headers['x-user-id'] as string;

      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing user identity context.',
        });
      }

      const venues = await this.venueService.getVenuesByOwner(ownerId);

      return res.status(200).json({
        success: true,
        data: venues,
      });
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const venueId = req.params.id as string;
      if (!venueId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid venue ID format.',
        });
      }

      const ownerId = req.headers['x-user-id'] as string;
      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing user identity context.',
        });
      }

      const result = await this.venueService.updateVenue(
        venueId,
        ownerId,
        req.body as UpdateVenueDto,
      );

      if (result.status === 'NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Venue not found.',
        });
      }

      if (result.status === 'FORBIDDEN') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not own this venue.',
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (err) {
      next(err);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const venueId = req.params.id as string;
      if (!venueId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid venue ID format.',
        });
      }

      const ownerId = req.headers['x-user-id'] as string;
      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing user identity context.',
        });
      }

      const result = await this.venueService.deleteVenue(venueId, ownerId);

      if (result.status === 'NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Venue not found.',
        });
      }

      if (result.status === 'FORBIDDEN') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not own this venue.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Venue deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /venues
   * Creates a new venue.
   */
  createClosure = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const venueId = req.params.id as string;
      if (!venueId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid venue ID format.',
        });
      }

      const ownerId = req.headers['x-user-id'] as string;
      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing user identity context.',
        });
      }

      const result = await this.venueService.createClosure(
        venueId,
        ownerId,
        req.body as CreateClosureDto,
      );

      if (result.status === 'VENUE_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Venue not found.',
        });
      }

      if (result.status === 'FORBIDDEN') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not own this venue.',
        });
      }

      if (
        result.status === 'INVALID_TIME' ||
        result.status === 'INVALID_TIME_RANGE'
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid closure time range details.',
        });
      }

      return res.status(201).json({
        success: true,
        data: result.data,
      });
    } catch (err) {
      next(err);
    }
  };

  getClosures = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const venueId = req.params.id as string;
      if (!venueId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid venue ID format.',
        });
      }

      const ownerId = req.headers['x-user-id'] as string;
      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing user identity context.',
        });
      }

      const result = await this.venueService.getClosures(venueId, ownerId);

      if (result.status === 'VENUE_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Venue not found.',
        });
      }

      if (result.status === 'FORBIDDEN') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not own this venue.',
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (err) {
      next(err);
    }
  };

  deleteClosure = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const venueId = req.params.id as string;
      if (!venueId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid venue ID format.',
        });
      }

      const closureId = req.params.closureId as string;
      if (!closureId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid closure ID format.',
        });
      }

      const ownerId = req.headers['x-user-id'] as string;
      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing user identity context.',
        });
      }

      const result = await this.venueService.deleteClosure(
        venueId,
        closureId,
        ownerId,
      );

      if (result.status === 'VENUE_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Venue not found.',
        });
      }

      if (result.status === 'FORBIDDEN') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not own this venue.',
        });
      }

      if (result.status === 'CLOSURE_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Closure not found or does not belong to this venue.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Venue closure deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  };

  updateClosure = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const venueId = req.params.id as string;
      if (!venueId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid venue ID format.',
        });
      }

      const closureId = req.params.closureId as string;
      if (!closureId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid closure ID format.',
        });
      }

      const ownerId = req.headers['x-user-id'] as string;
      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing user identity context.',
        });
      }

      const result = await this.venueService.updateClosure(
        venueId,
        closureId,
        ownerId,
        req.body as UpdateClosureDto,
      );

      if (result.status === 'VENUE_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Venue not found.',
        });
      }

      if (result.status === 'FORBIDDEN') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not own this venue.',
        });
      }

      if (result.status === 'CLOSURE_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Closure not found or does not belong to this venue.',
        });
      }

      if (
        result.status === 'INVALID_TIME' ||
        result.status === 'INVALID_TIME_RANGE'
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid closure time range details.',
        });
      }

      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (err) {
      next(err);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const userIdStr = req.headers['x-user-id'] as string;
      const ownerId = userIdStr;

      if (!ownerId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing user identity context.',
        });
      }

      const venue = await this.venueService.createVenue(
        ownerId,
        req.body as CreateVenueDto,
      );

      return res.status(201).json({
        success: true,
        data: venue,
      });
    } catch (error) {
      next(error);
    }
  };

  // ─── Saved Venues ─────────────────────────────────────────────────────────

  getSavedVenues = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized.',
        });
      }

      const result = await this.venueService.getSavedVenues(user.id);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  saveVenue = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized.',
        });
      }

      const venueId = req.params.id as string;
      if (!venueId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid venue ID format.',
        });
      }

      const result = await this.venueService.saveVenue(user.id, venueId);
      if (result.status === 'VENUE_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Venue not found.',
        });
      }

      if (result.status === 'ALREADY_SAVED') {
        return res.status(400).json({
          success: false,
          message: 'Venue is already saved.',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Venue saved successfully.',
        data: result.data,
      });
    } catch (err) {
      next(err);
    }
  };

  unsaveVenue = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized.',
        });
      }

      const venueId = req.params.id as string;
      if (!venueId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid venue ID format.',
        });
      }

      const result = await this.venueService.unsaveVenue(user.id, venueId);
      if (result.status === 'NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Saved venue not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Venue unsaved successfully.',
      });
    } catch (err) {
      next(err);
    }
  };
}
