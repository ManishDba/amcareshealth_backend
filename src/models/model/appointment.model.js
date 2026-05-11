const { DataTypes } = require("sequelize");

const Appointment = (sequelize) => {
  return sequelize.define(
    "Appointment",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      time: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      consultType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "clinic",
      },
      patientDetails: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      refCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      timestamps: true,
    }
  );
};

module.exports = Appointment;
