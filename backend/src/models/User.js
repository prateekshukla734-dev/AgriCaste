import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  phone: { type: String, index: true, unique: true, sparse: true },
  email: { type: String, index: true, unique: true, sparse: true },
  password: { type: String, required: true },
  language: { type: String, default: 'en' }, // 'en' or 'hi' etc
  role: { type: String, enum: ['farmer','admin','agronomist'], default: 'farmer' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
}, {
  toJSON: { virtuals: true, transform(doc, ret){ delete ret.password; return ret; } },
  toObject: { virtuals: true }
});

// pre-save: hash password if modified
UserSchema.pre('save', async function(next){
  try {
    if (!this.isModified('password')) return next();
    const hashed = await bcrypt.hash(this.password, SALT_ROUNDS);
    this.password = hashed;
    return next();
  } catch (err) {
    return next(err);
  }
});

// instance method: compare password
UserSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', UserSchema);
