import { Router } from 'express';
import { requireOwner, requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createVenueSchema,
  updateVenueSchema,
  createClosureSchema,
  getClosuresSchema,
  deleteClosureSchema,
  updateClosureSchema,
} from '../validators/venue.validator';
import { VenueController } from '../controllers/venue.controller';

const router = Router();
const controller = new VenueController();

router.post('/', requireOwner, validate(createVenueSchema), controller.create);
router.get('/', controller.getAllVenues);
router.get('/amenities', controller.getAllAmenities);
router.get('/my-venues', requireOwner, controller.getMyVenues);
router.get('/saved', requireAuth, controller.getSavedVenues);
router.post('/:id/save', requireAuth, controller.saveVenue);
router.delete('/:id/save', requireAuth, controller.unsaveVenue);
router.get('/:id', controller.getVenueById);
router.put(
  '/:id',
  requireOwner,
  validate(updateVenueSchema),
  controller.update,
);
router.delete('/:id', requireOwner, controller.delete);
router.post(
  '/:id/closures',
  requireOwner,
  validate(createClosureSchema),
  controller.createClosure,
);
router.get(
  '/:id/closures',
  requireOwner,
  validate(getClosuresSchema),
  controller.getClosures,
);
router.delete(
  '/:id/closures/:closureId',
  requireOwner,
  validate(deleteClosureSchema),
  controller.deleteClosure,
);
router.put(
  '/:id/closures/:closureId',
  requireOwner,
  validate(updateClosureSchema),
  controller.updateClosure,
);

export default router;
