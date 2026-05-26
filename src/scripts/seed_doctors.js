// Seed script to add required doctors
// Run with: npm run seed:doctors

const { models, sequelize } = require('../models');

async function seedDoctors() {
  try {
    // Ensure table exists
    await sequelize.sync();
    const doctors = [
      {
        name: 'Dr. Subash Gupta',
        specialization: 'Liver Surgeon',
        hospital: 'A‑Cares Hospital',
        bio: 'Expert liver surgeon with 15 years of experience.',
        rating: 4.9,
        experience: 15,
        initials: 'SG',
        bgColor: '#ffebee',
        fgColor: '#b71c1c',
      },
      {
        name: 'Dr. Ananya Rao',
        specialization: 'Heart Surgeon',
        hospital: 'A‑Cares Hospital',
        bio: 'Renowned heart surgeon specializing in cardiac bypass.',
        rating: 4.8,
        experience: 12,
        initials: 'AR',
        bgColor: '#e3f2fd',
        fgColor: '#0d47a1',
      },
      {
        name: 'Dr. Vikram Singh',
        specialization: 'Kidney Surgeon',
        hospital: 'A‑Cares Hospital',
        bio: 'Kidney transplant specialist with 10 years of practice.',
        rating: 4.7,
        experience: 10,
        initials: 'VS',
        bgColor: '#e8f5e9',
        fgColor: '#1b5e20',
      },
    ];

    await models.doctors.bulkCreate(doctors, { ignoreDuplicates: true });
    console.log('✅ Doctors seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding doctors:', err);
    process.exit(1);
  }
}

seedDoctors();
