'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrganTransplant extends Model {
    static associate(models) {
      OrganTransplant.belongsTo(models.users, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  OrganTransplant.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('recipient', 'donor'),
      allowNull: false
    },
    organ: {
      type: DataTypes.STRING,
      allowNull: false
    },
    patientName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bloodGroup: {
      type: DataTypes.STRING,
      allowNull: false
    },
    medicalHistory: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    urgency: {
      type: DataTypes.ENUM('critical', 'high', 'medium', 'low'),
      allowNull: false,
      defaultValue: 'medium'
    },
    refCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'organTransplants',
  });
  return OrganTransplant;
};
