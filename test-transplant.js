const { models } = require('./src/models');
const crypto = require('crypto');

async function test() {
  try {
    const userId = 1; // Assuming user ID 1 exists
    const refCode = `AMC-TRANS-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    
    const registration = await models.organTransplants.create({
      userId,
      type: 'recipient',
      organ: 'heart',
      patientName: 'Test Patient',
      email: 'test@example.com',
      phone: '1234567890',
      age: 30,
      city: 'Test City',
      bloodGroup: 'A+',
      medicalHistory: 'None',
      urgency: 'medium',
      refCode,
      status: 'active'
    });
    console.log("Success:", registration.toJSON());
  } catch (err) {
    console.error("Error creating transplant:", err);
  }
  process.exit();
}

test();
