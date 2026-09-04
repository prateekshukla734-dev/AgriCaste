import Farm from '../models/Farm.js';
import mongoose from 'mongoose';

/**
 * createFarm
 * farmData must include: name, userId, geom (GeoJSON polygon), optional area, soil, lastCrop
 */
async function createFarm(farmData) {
  // validate geom shape minimal checks
  if (!farmData.geom || !farmData.geom.type || !farmData.geom.coordinates) {
    throw { status: 400, message: 'Invalid geom. Provide GeoJSON Polygon coordinates.' };
  }
  // Optionally compute area server-side using turf (or PostGIS later).
  const farm = new Farm(farmData);
  await farm.save();
  return farm.toObject();
}

async function getFarmById(id) {
  if (!mongoose.isValidObjectId(id)) throw { status: 400, message: 'Invalid farm id' };
  const farm = await Farm.findById(id).lean();
  if (!farm) throw { status: 404, message: 'Farm not found' };
  return farm;
}

async function updateFarm(id, patch, userId) {
  // ensure owning user matches (extra protection)
  const farm = await Farm.findById(id);
  if (!farm) throw { status: 404, message: 'Farm not found' };
  if (farm.userId.toString() !== userId) throw { status: 403, message: 'Forbidden' };

  // merge patch into farm and save
  Object.assign(farm, patch);
  await farm.save();
  return farm.toObject();
}

async function deleteFarm(id, userId) {
  const farm = await Farm.findById(id);
  if (!farm) throw { status: 404, message: 'Farm not found' };
  if (farm.userId.toString() !== userId) throw { status: 403, message: 'Forbidden' };
  await farm.deleteOne();
  return { success: true };
}

async function listFarmsByUser(userId, opts = { limit: 50, skip: 0 }) {
  const q = Farm.find({ userId }).sort({ createdAt: -1 }).skip(opts.skip).limit(opts.limit).lean();
  return q.exec();
}

export { createFarm, getFarmById, updateFarm, deleteFarm, listFarmsByUser };
export default { createFarm, getFarmById, updateFarm, deleteFarm, listFarmsByUser };
