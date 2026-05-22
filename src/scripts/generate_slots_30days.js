/**
 * Generate doctor slots for the next 30 days (for testing)
 * Usage: npm run generate-slots-30
 */

const { models, sequelize } = require("../models");

const generateSlotsFor30Days = async () => {
  try {
    console.log("🏥 Starting slot generation for next 30 days...\n");
    
    // Fetch all doctors
    const doctors = await models.doctors.findAll();
    if (doctors.length === 0) {
      console.error("❌ No doctors found in database. Please seed doctors first.");
      process.exit(1);
    }

    console.log(`👨‍⚕️  Found ${doctors.length} doctors`);

    // Define time slots (12-hour format)
    const timeSlots = [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
      "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
      "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
    ];

    const slotsToCreate = [];
    let totalSlots = 0;

    // Generate dates for the next 30 days (skip weekends if needed)
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Optional: Skip weekends (comment out to include weekends)
      const day = date.getDay();
      if (day === 0 || day === 6) {
        console.log(`⏭️  Skipping weekend: ${date.toISOString().split("T")[0]}`);
        continue; // Skip Sundays (0) and Saturdays (6)
      }

      const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD

      for (const doctor of doctors) {
        for (const time of timeSlots) {
          slotsToCreate.push({
            doctorId: doctor.id,
            date: dateString,
            time: time,
            isBooked: false,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
      totalSlots += doctors.length * timeSlots.length;
    }

    console.log(`\n⏰ Time slots per doctor per day: ${timeSlots.length}`);
    console.log(`📅 Total slots to create: ${slotsToCreate.length}\n`);

    // Clear existing future slots to avoid duplicates
    console.log("🗑️  Clearing old slots...");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const clearedCount = await models.doctorSlots.destroy({
      where: {
        date: {
          [sequelize.Sequelize.Op.gte]: today.toISOString().split("T")[0]
        }
      }
    });

    console.log(`✅ Cleared ${clearedCount} old slots\n`);

    // Bulk create new slots
    console.log("📝 Creating new slots...");
    const startTime = Date.now();
    
    // Batch insert in chunks to avoid memory issues
    const chunkSize = 1000;
    for (let i = 0; i < slotsToCreate.length; i += chunkSize) {
      const chunk = slotsToCreate.slice(i, i + chunkSize);
      await models.doctorSlots.bulkCreate(chunk, { 
        ignoreDuplicates: false 
      });
      console.log(`  ✓ Inserted ${Math.min(i + chunkSize, slotsToCreate.length)} / ${slotsToCreate.length} slots`);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n✨ SUCCESS! Generated ${slotsToCreate.length} slots in ${duration}s`);
    console.log(`\n📊 Summary:`);
    console.log(`   • Doctors: ${doctors.length}`);
    console.log(`   • Time slots/day: ${timeSlots.length}`);
    console.log(`   • Days: 30 (weekdays only)`);
    console.log(`   • Total slots: ${slotsToCreate.length}`);
    
    console.log(`\n✅ All doctor slots are ready for testing!\n`);
    process.exit(0);

  } catch (error) {
    console.error("❌ Error generating slots:", error.message);
    console.error(error);
    process.exit(1);
  }
};

generateSlotsFor30Days();
