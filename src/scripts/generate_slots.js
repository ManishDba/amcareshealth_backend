const { models, sequelize } = require("../models/index");

const generateSlots = async () => {
  try {
    console.log("🚀 Starting slot generation for next 15 days...");
    
    const doctors = await models.doctors.findAll();
    if (doctors.length === 0) {
      console.error("❌ No doctors found in database.");
      process.exit(1);
    }

    const slotsToCreate = [];
    const timeSlots = [
      "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
      "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM",
      "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
    ];

    // Generate dates for the next 15 days
    for (let i = 0; i < 15; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD

      for (const doctor of doctors) {
        for (const time of timeSlots) {
          slotsToCreate.push({
            doctorId: doctor.id,
            date: dateString,
            time: time,
            isBooked: false
          });
        }
      }
    }

    console.log(`📦 Preparing to insert ${slotsToCreate.length} slots...`);

    // Use bulkCreate for efficiency
    // We use ignoreDuplicates: true if the DB supports it, or just let it fail for duplicates if unique constraint exists
    // But DoctorSlot doesn't have a unique constraint on (doctorId, date, time) in the model definition.
    // So we should manually check or just bulkCreate.
    
    // Clear existing future slots to avoid duplicates if re-running
    const tomorrow = new Date();
    tomorrow.setHours(0,0,0,0);
    
    await models.doctorSlots.destroy({
      where: {
        date: {
          [sequelize.Sequelize.Op.gte]: tomorrow.toISOString().split("T")[0]
        }
      }
    });

    await models.doctorSlots.bulkCreate(slotsToCreate);
    
    console.log(`✅ Successfully added slots for ${doctors.length} doctors for the next 15 days.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error generating slots:", error);
    process.exit(1);
  }
};

generateSlots();
