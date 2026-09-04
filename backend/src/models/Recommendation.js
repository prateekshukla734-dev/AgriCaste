import mongoose from 'mongoose';

const RecommendationSchema = new mongoose.Schema(
  {
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    recommended_crop: { type: String, required: true },
    expected_yield: { type: Number }, 
    expected_profit: { type: Number },
    sustainability_score: { type: Number, min: 0, max: 1 },
    explanation_json: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model('Recommendation', RecommendationSchema);
