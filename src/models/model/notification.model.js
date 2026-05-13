const { DataTypes } = require("sequelize");

const Notification = (sequelize) => {
  return sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(
          'appointment_confirmed',
          'appointment_cancelled',
          'appointment_reminder',
          'queue_update',
          'transplant_update',
          'system',
          'promotion',
          'chat'
        ),
        allowNull: false,
        defaultValue: 'system',
      },
      data: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
    }
  );
};

module.exports = Notification;
