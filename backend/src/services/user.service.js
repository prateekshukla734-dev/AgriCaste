import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function createUser({ name, phone, email, password, language }) {
  console.log('Creating user with data:', { name, phone, email, password: '***', language });
  
  // Basic uniqueness check
  if (phone) {
    console.log('Checking phone uniqueness:', phone);
    const existing = await User.findOne({ phone });
    if (existing) {
      console.log('Phone already exists');
      throw { status: 409, message: 'Phone already registered' };
    }
  }
  if (email) {
    console.log('Checking email uniqueness:', email);
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Email already exists');
      throw { status: 409, message: 'Email already registered' };
    }
  }
  
  console.log('Creating new user instance');
  const user = new User({ name, phone, email, password, language });
  console.log('Saving user to database');
  await user.save();
  console.log('User saved successfully');
  return user.toObject();
}

async function authenticate({ phoneOrEmail, password }) {
  const query = phoneOrEmail.includes('@') ? { email: phoneOrEmail } : { phone: phoneOrEmail };
  const user = await User.findOne(query);
  if (!user) throw { status: 401, message: 'Invalid credentials' };

  const ok = await user.comparePassword(password);
  if (!ok) throw { status: 401, message: 'Invalid credentials' };

  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign({ sub: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { user: user.toObject(), token };
}

async function getUserById(id) {
  return User.findById(id).select('-password').lean();
}

async function updateUser(id, patch) {
  // prevent password updates here; create separate endpoint if needed
  if (patch.password) delete patch.password;
  await User.findByIdAndUpdate(id, patch, { new: true });
  return getUserById(id);
}

export { createUser, authenticate, getUserById, updateUser };
export default {
  createUser,
  authenticate,
  getUserById,
  updateUser,
};
