const { DataTypes } = require("sequelize");

const Doctor = (sequelize) => {
  return sequelize.define(
    "Doctor",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      specialization: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hospital: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      experience: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      initials: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bgColor: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fgColor: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
    }
  );
};

module.exports = Doctor;
