const { models } = require("../models");

/**
 * Script to add test slots for all doctors for today and tomorrow.
 */
async function addTestSlots() {
  console.log("--- Starting Slot Generation ---");
  try {
    const doctors = await models.doctors.findAll();
    const times = ["09:00", "10:30", "12:00", "14:30", "16:00", "17:30"];
    const today = new Date();
    
    let createdCount = 0;

    for (const doctor of doctors) {
      console.log(`Generating slots for: ${doctor.name}`);
      
      for (let i = 0; i < 2; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split("T")[0];

        for (const time of times) {
          // Check if slot already exists
          const existing = await models.doctorSlots.findOne({
            where: {
              doctorId: doctor.id,
              date: dateString,
              time: time
            }
          });

          if (!existing) {
            await models.doctorSlots.create({
              doctorId: doctor.id,
              date: dateString,
              time: time,
              isBooked: false
            });
            createdCount++;
          }
        }
      }
    }

    console.log(`--- Success! Created ${createdCount} new slots ---`);
    process.exit(0);
  } catch (error) {
    console.error("--- Failed to generate slots ---");
    console.error(error);
    process.exit(1);
  }
}

addTestSlots();
