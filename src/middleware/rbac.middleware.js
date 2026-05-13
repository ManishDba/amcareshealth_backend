const { ForbiddenError } = require('../utils/AppError');

const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  COORDINATOR: 'coordinator',
};

const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.DOCTOR, ROLES.PATIENT],
  [ROLES.ADMIN]: [ROLES.COORDINATOR, ROLES.DOCTOR, ROLES.PATIENT],
  [ROLES.COORDINATOR]: [ROLES.PATIENT],
  [ROLES.DOCTOR]: [ROLES.PATIENT],
  [ROLES.PATIENT]: [],
};

const hasRole = (userRole, requiredRole) => {
  if (userRole === requiredRole) return true;
  const inherited = ROLE_HIERARCHY[userRole] || [];
  return inherited.includes(requiredRole);
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ForbiddenError('Access denied. Role information missing.'));
    }
    const userRole = req.user.role;
    const hasAccess = roles.some(role => hasRole(userRole, role));
    if (!hasAccess) {
      return next(new ForbiddenError(`Access denied. Required role: ${roles.join(' or ')}.`));
    }
    next();
  };
};

module.exports = { ROLES, requireRole, hasRole };
