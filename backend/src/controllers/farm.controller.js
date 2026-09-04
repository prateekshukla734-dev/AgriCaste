import Joi from 'joi';
import farmService from '../services/farm.service.js';

// Custom validation function for GeoJSON coordinates
const validateGeoJSONCoordinates = (coordinates, helpers) => {
  try {
    // For Polygon: coordinates should be [[[lng, lat], [lng, lat], ...]]
    // For MultiPolygon: coordinates should be [[[[lng, lat], [lng, lat], ...]], ...]
    const checkCoordinate = (coord) => {
      if (!Array.isArray(coord) || coord.length !== 2) {
        throw new Error('Each coordinate must be an array of [longitude, latitude]');
      }
      const [lng, lat] = coord;
      if (typeof lng !== 'number' || typeof lat !== 'number') {
        throw new Error('Longitude and latitude must be numbers');
      }
      if (lng < -180 || lng > 180) {
        throw new Error(`Longitude ${lng} is out of bounds. Must be between -180 and 180`);
      }
      if (lat < -90 || lat > 90) {
        throw new Error(`Latitude ${lat} is out of bounds. Must be between -90 and 90`);
      }
    };

    const validateRing = (ring) => {
      if (!Array.isArray(ring) || ring.length < 4) {
        throw new Error('Each ring must have at least 4 coordinate pairs');
      }
      ring.forEach(checkCoordinate);
      // First and last coordinates should be the same (closed ring)
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        throw new Error('Ring must be closed (first and last coordinates must be the same)');
      }
    };

    if (Array.isArray(coordinates[0]) && Array.isArray(coordinates[0][0])) {
      if (Array.isArray(coordinates[0][0][0])) {
        // MultiPolygon: [[[[lng, lat], ...]]]
        coordinates.forEach(polygon => {
          polygon.forEach(validateRing);
        });
      } else {
        // Polygon: [[[lng, lat], ...]]
        coordinates.forEach(validateRing);
      }
    } else {
      throw new Error('Invalid coordinate structure');
    }

    return coordinates;
  } catch (error) {
    return helpers.error('any.invalid', { message: error.message });
  }
};

const createFarmSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  geom: Joi.object({ 
    type: Joi.string().valid('Polygon','MultiPolygon').required(), 
    coordinates: Joi.array().custom(validateGeoJSONCoordinates).required()
  }).required(),
  area: Joi.number().optional(),
  irrigationType: Joi.string().optional(),
  soil: Joi.object({
    ph: Joi.number().min(0).max(14).optional(),
    n: Joi.number().optional(),
    p: Joi.number().optional(),
    k: Joi.number().optional(),
    lastTestedAt: Joi.date().optional()
  }).optional(),
  lastCrop: Joi.string().optional(),
  metadata: Joi.object().optional()
});

const updateFarmSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  geom: Joi.object({ 
    type: Joi.string().valid('Polygon','MultiPolygon'), 
    coordinates: Joi.array().custom(validateGeoJSONCoordinates)
  }).optional(),
  area: Joi.number().optional(),
  irrigationType: Joi.string().optional(),
  soil: Joi.object({
    ph: Joi.number().min(0).max(14).optional(),
    n: Joi.number().optional(),
    p: Joi.number().optional(),
    k: Joi.number().optional(),
    lastTestedAt: Joi.date().optional()
  }).optional(),
  lastCrop: Joi.string().optional(),
  metadata: Joi.object().optional()
});

export async function createFarm(req, res, next) {
  try {
    console.log('=== Farm Creation Debug ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User info:', req.user);
    
    const { error, value } = createFarmSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.message);
      console.log('Error details:', error.details);
      return res.status(400).json({ error: error.message });
    }

    console.log('Validated data:', JSON.stringify(value, null, 2));
    const farmData = Object.assign({}, value, { userId: req.user.sub });
    console.log('Final farm data:', JSON.stringify(farmData, null, 2));
    
    const farm = await farmService.createFarm(farmData);
    console.log('Created farm:', farm);
    return res.status(201).json({ farm });
  } catch (err) { 
    console.log('Error in createFarm:', err);
    next(err); 
  }
}

export async function getFarm(req, res, next) {
  try {
    const farm = await farmService.getFarmById(req.params.id);
    // ensure user can view it or admin
    if (farm.userId.toString() !== req.user.sub && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    return res.json({ farm });
  } catch (err) { next(err); }
}

export async function listFarms(req, res, next) {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const farms = await farmService.listFarmsByUser(req.user.sub, { limit: parseInt(limit,10), skip: parseInt(skip,10) });
    return res.json({ farms });
  } catch (err) { next(err); }
}

export async function updateFarm(req, res, next) {
  try {
    const { error, value } = updateFarmSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const farm = await farmService.updateFarm(req.params.id, value, req.user.sub);
    return res.json({ farm });
  } catch (err) { next(err); }
}

export async function deleteFarm(req, res, next) {
  try {
    await farmService.deleteFarm(req.params.id, req.user.sub);
    return res.json({ success: true });
  } catch (err) { next(err); }
}

export default { createFarm, getFarm, listFarms, updateFarm, deleteFarm };
