import mongoose from 'mongoose';

const GeoJSONPolygonSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Polygon', 'MultiPolygon'], required: true },
    coordinates: { type: Array, required: true },
  },
  { _id: false }
);

const SoilSchema = new mongoose.Schema(
  {
    ph: { type: Number, min: 0, max: 14 },
    n: { type: Number },
    p: { type: Number },
    k: { type: Number },
    lastTestedAt: { type: Date },
  },
  { _id: false }
);

const FarmSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    geom: { type: GeoJSONPolygonSchema, required: true },
    area: { type: Number }, // hectares
    irrigationType: { type: String },
    soil: { type: SoilSchema },
    lastCrop: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

FarmSchema.index({ geom: '2dsphere' });

export default mongoose.model('Farm', FarmSchema);
