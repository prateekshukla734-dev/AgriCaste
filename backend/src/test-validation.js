// Test registration validation locally
import Joi from 'joi';

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  phone: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  language: Joi.string().valid('en','hi','bn','te','ta','mr','gu','kn','ml','pa').optional()
});

// Test various registration payloads
const testCases = [
  // Valid case
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  },
  // Missing name
  {
    email: 'john@example.com',
    password: 'password123'
  },
  // Short password
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: '123'
  },
  // Invalid email
  {
    name: 'John Doe',
    email: 'invalid-email',
    password: 'password123'
  },
  // No email or phone
  {
    name: 'John Doe',
    password: 'password123'
  },
  // Valid with all fields including supported language
  {
    name: 'John Doe',
    phone: '1234567890',
    email: 'john@example.com',
    password: 'password123',
    language: 'hi'
  },
  // Invalid language
  {
    name: 'John Doe',
    phone: '1234567890',
    email: 'john@example.com',
    password: 'password123',
    language: 'fr'
  },
  // Valid with Bengali language (one from frontend)
  {
    name: 'John Doe',
    phone: '1234567890',
    email: 'john@example.com',
    password: 'password123',
    language: 'bn'
  }
];

console.log('=== Registration Validation Tests ===');
testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}:`, JSON.stringify(testCase, null, 2));
  const { error, value } = registerSchema.validate(testCase);
  if (error) {
    console.log('❌ Validation Error:', error.message);
  } else {
    console.log('✅ Valid');
  }
});