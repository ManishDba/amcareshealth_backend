const sequelize = require('../config/db.config');
const User = require('../models/model/user.model');


const models = {}

models.users = User(sequelize)
models.sequelize = sequelize

module.exports = {
  sequelize,
  models
};