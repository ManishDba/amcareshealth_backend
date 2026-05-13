const { ValidationError } = require('../utils/AppError');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    const errors = [];
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: rules.message || `${field} is required.` });
        continue;
      }
      if (value === undefined || value === null || value === '') continue;
      if (rules.type === 'number' && isNaN(Number(value))) {
        errors.push({ field, message: `${field} must be a number.` });
      }
      if (rules.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push({ field, message: `${field} must be a valid email address.` });
      }
      if (rules.minLength && String(value).length < rules.minLength) {
        errors.push({ field, message: `${field} must be at least ${rules.minLength} characters.` });
      }
      if (rules.maxLength && String(value).length > rules.maxLength) {
        errors.push({ field, message: `${field} must not exceed ${rules.maxLength} characters.` });
      }
      if (rules.pattern && !rules.pattern.test(String(value))) {
        errors.push({ field, message: rules.patternMessage || `${field} format is invalid.` });
      }
    }
    if (errors.length > 0) {
      return next(new ValidationError('Validation failed', errors));
    }
    next();
  };
};

const schemas = {
  signup: {
    name: { required: true, minLength: 2, maxLength: 100 },
    phone: { required: true, pattern: /^\d{10}$/, patternMessage: 'Phone must be a 10-digit number.' },
    password: { required: true, minLength: 4, maxLength: 128 },
    email: { type: 'email' },
  },
  signin: {
    phone: { required: true, pattern: /^\d{10}$/, patternMessage: 'Phone must be a 10-digit number.' },
    password: { required: true },
  },
  bookAppointment: {
    doctorId: { required: true, type: 'number' },
    slotId: { required: true, type: 'number' },
    patientDetails: { required: true },
  },
  createDoctor: {
    name: { required: true, minLength: 2 },
    specialization: { required: true },
    hospital: { required: true },
  },
};

module.exports = { validate, schemas };
