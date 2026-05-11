"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Seed Doctors
    const doctors = await queryInterface.bulkInsert(
      "Doctors",
      [
        {
          name: "Dr. Rajesh Iyer",
          specialization: "Liver Transplant Surgeon",
          hospital: "AmCares Multi-Specialty",
          bio: "Senior Consultant with 20+ years of expertise in Liver Transplantation and Hepatobiliary Surgery.",
          rating: 4.9,
          experience: 22,
          initials: "RI",
          bgColor: "#FFF0E8",
          fgColor: "#993C1D",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Dr. Sarah D'Souza",
          specialization: "Kidney Transplant Specialist",
          hospital: "Global Health City",
          bio: "Dedicated nephrologist specializing in renal transplants and chronic kidney disease management.",
          rating: 4.8,
          experience: 14,
          initials: "SD",
          bgColor: "#EBF3FF",
          fgColor: "#185FA5",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Dr. Amitav Ghosh",
          specialization: "Heart Transplant Surgeon",
          hospital: "Apollo Cardiac Center",
          bio: "Renowned cardiothoracic surgeon known for successful heart transplants and advanced cardiac care.",
          rating: 5.0,
          experience: 18,
          initials: "AG",
          bgColor: "#F0FFF4",
          fgColor: "#22543D",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Dr. Meera Krishnan",
          specialization: "Bone Marrow Specialist",
          hospital: "OncoCare Institute",
          bio: "Hematologist-oncologist focused on bone marrow transplants and regenerative medicine.",
          rating: 4.7,
          experience: 11,
          initials: "MK",
          bgColor: "#FFF5F5",
          fgColor: "#822727",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Dr. Vikram Malhotra",
          specialization: "Lung Transplant Surgeon",
          hospital: "Metro Pulmo Center",
          bio: "Expert in complex lung transplants and thoracic surgeries with a patient-first approach.",
          rating: 4.6,
          experience: 15,
          initials: "VM",
          bgColor: "#FAF5FF",
          fgColor: "#553C9A",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Dr. Anisa Khan",
          specialization: "Multi-Organ Specialist",
          hospital: "AmCares Multi-Specialty",
          bio: "Specializing in coordinated care for multi-organ transplant recipients and donor management.",
          rating: 4.8,
          experience: 12,
          initials: "AK",
          bgColor: "#E6FFFA",
          fgColor: "#234E52",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: true }
    );

    // 2. Seed Slots for the next 3 days
    const slots = [];
    const times = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
    const today = new Date();

    doctors.forEach((doctor) => {
      for (let i = 0; i < 3; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split("T")[0];

        times.forEach((time) => {
          slots.push({
            doctorId: doctor.id,
            date: dateString,
            time: time,
            isBooked: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });
      }
    });

    await queryInterface.bulkInsert("DoctorSlots", slots);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("DoctorSlots", null, {});
    await queryInterface.bulkDelete("Doctors", null, {});
  },
};
