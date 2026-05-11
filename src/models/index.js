const sequelize = require('../config/db.config');
const User = require('../models/model/user.model');
const Doctor = require('../models/model/doctor.model');
const DoctorSlot = require('../models/model/doctor-slot.model');
const Appointment = require('../models/model/appointment.model');

const models = {}

models.users = User(sequelize);
models.doctors = Doctor(sequelize);
models.doctorSlots = DoctorSlot(sequelize);
models.appointments = Appointment(sequelize);

// Associations
models.doctors.hasMany(models.doctorSlots, { foreignKey: 'doctorId', as: 'slots' });
models.doctorSlots.belongsTo(models.doctors, { foreignKey: 'doctorId', as: 'doctor' });

models.doctors.hasMany(models.appointments, { foreignKey: 'doctorId', as: 'appointments' });
models.appointments.belongsTo(models.doctors, { foreignKey: 'doctorId', as: 'doctor' });

models.users.hasMany(models.appointments, { foreignKey: 'userId', as: 'appointments' });
models.appointments.belongsTo(models.users, { foreignKey: 'userId', as: 'user' });

models.sequelize = sequelize

module.exports = {
  sequelize,
  models
};