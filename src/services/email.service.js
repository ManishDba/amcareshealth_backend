const nodemailer = require("nodemailer");
const { 
  SMTP_HOST, 
  SMTP_PORT, 
  SMTP_USER, 
  SMTP_PASS, 
  FROM_EMAIL 
} = require("../../env");

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send an email with a modern HTML template
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"AmCaresHealth" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    // Don't throw error to avoid breaking the main flow
    return null;
  }
};

/**
 * Template for Registration Welcome Email
 */
const sendRegistrationEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Manrope', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #3D6080 0%, #14182D 100%); padding: 30px; text-align: center; color: white; }
        .content { padding: 30px; background: #fff; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #3D6080; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
        .welcome-msg { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #3D6080; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AmCaresHealth</h1>
        </div>
        <div class="content">
          <div class="welcome-msg">Welcome to AmCaresHealth!</div>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Thank you for joining AmCaresHealth. We are committed to providing you with the best healthcare experience.</p>
          <p>Your account has been successfully created. You can now book appointments, track your health records, and connect with expert doctors.</p>
          <a href="#" class="button">Explore Dashboard</a>
          <p>If you have any questions, feel free to reply to this email.</p>
          <p>Stay healthy,<br>The AmCaresHealth Team</p>
        </div>
        <div class="footer">
          &copy; 2026 AmCaresHealth. All rights reserved.<br>
          This is an automated email, please do not reply directly.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: "Welcome to AmCaresHealth!",
    html,
  });
};

/**
 * Send Notification Email to Organization for New Registration
 */
const sendRegistrationNotification = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
      <h2>New User Registered</h2>
      <p>A new user has registered on AmCaresHealth.</p>
      <ul>
        <li><strong>Name:</strong> ${user.name}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Phone:</strong> ${user.phone}</li>
        <li><strong>Age:</strong> ${user.age || "N/A"}</li>
      </ul>
    </div>
  `;

  return sendEmail({
    to: "amcareshealthorganization@gmail.com",
    subject: `🚨 New Registration: ${user.name}`,
    html,
  });
};

/**
 * Template for Appointment Booking Confirmation
 */
const sendAppointmentEmail = async (appointment, user, doctor) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Manrope', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #3D6080 0%, #14182D 100%); padding: 30px; text-align: center; color: white; }
        .content { padding: 30px; background: #fff; }
        .details-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3D6080; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; background: #f9f9f9; }
        .ref-code { font-family: monospace; font-size: 18px; color: #3D6080; font-weight: bold; }
        .status { display: inline-block; padding: 4px 12px; background: #d4edda; color: #155724; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Appointment Confirmed</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Your appointment has been successfully booked. Here are the details:</p>
          
          <div class="details-box">
            <p><strong>Reference Code:</strong> <span class="ref-code">${appointment.refCode}</span></p>
            <p><strong>Doctor:</strong> ${doctor.name} (${doctor.specialization})</p>
            <p><strong>Date:</strong> ${appointment.date}</p>
            <p><strong>Time:</strong> ${appointment.time}</p>
            <p><strong>Consultation Type:</strong> ${appointment.consultType}</p>
            <p><strong>Status:</strong> <span class="status">${appointment.status}</span></p>
          </div>

          <h3>Patient Details</h3>
          <div class="details-box">
            <p><strong>Patient Name:</strong> ${appointment.patientDetails?.fname} ${appointment.patientDetails?.lname}</p>
            <p><strong>Age:</strong> ${appointment.patientDetails?.age || "N/A"}</p>
            <p><strong>Gender:</strong> ${appointment.patientDetails?.gender || "N/A"}</p>
            <p><strong>Phone:</strong> ${appointment.patientDetails?.phone || "N/A"}</p>
            <p><strong>Email:</strong> ${appointment.patientDetails?.email || "N/A"}</p>
            <p><strong>Reason(s):</strong> ${appointment.patientDetails?.reasons?.join(', ') || "N/A"}</p>
            <p><strong>Notes:</strong> ${appointment.patientDetails?.notes || "No extra notes"}</p>
          </div>

          <p style="font-size: 13px; color: #666;">Booked by: ${user.name} (${user.email})</p>

          <p>Please arrive 10 minutes early for your appointment. If it's an online consultation, you will receive a link 15 minutes before the start time.</p>
          <p>Need to reschedule? Contact us at support@amcareshealth.com or use our mobile app.</p>
          <p>Best regards,<br>The AmCaresHealth Team</p>
        </div>
        <div class="footer">
          &copy; 2026 AmCaresHealth. All rights reserved.<br>
          Hospital: ${doctor.hospital || "AmCaresHealth Center"}
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `Appointment Confirmed: ${appointment.refCode}`,
    html,
  });
};

/**
 * Send Notification Email to Organization for New Appointment
 */
const sendAppointmentNotification = async (appointment, user, doctor) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #3D6080;">New Appointment Booked</h2>
      <p>A new appointment has been scheduled via the mobile app.</p>
      
      <h3 style="border-bottom: 1px solid #eee; padding-bottom: 8px;">Schedule Info</h3>
      <ul style="list-style: none; padding-left: 0;">
        <li><strong>Ref Code:</strong> ${appointment.refCode}</li>
        <li><strong>Doctor:</strong> ${doctor.name}</li>
        <li><strong>Date:</strong> ${appointment.date}</li>
        <li><strong>Time:</strong> ${appointment.time}</li>
        <li><strong>Consultation:</strong> ${appointment.consultType}</li>
      </ul>

      <h3 style="border-bottom: 1px solid #eee; padding-bottom: 8px;">Patient Details</h3>
      <ul style="list-style: none; padding-left: 0;">
        <li><strong>Name:</strong> ${appointment.patientDetails?.fname} ${appointment.patientDetails?.lname}</li>
        <li><strong>Age:</strong> ${appointment.patientDetails?.age || "N/A"}</li>
        <li><strong>Gender:</strong> ${appointment.patientDetails?.gender || "N/A"}</li>
        <li><strong>Phone:</strong> ${appointment.patientDetails?.phone || "N/A"}</li>
        <li><strong>Email:</strong> ${appointment.patientDetails?.email || "N/A"}</li>
        <li><strong>Reasons:</strong> ${appointment.patientDetails?.reasons?.join(', ') || "N/A"}</li>
        <li><strong>Notes:</strong> ${appointment.patientDetails?.notes || "N/A"}</li>
      </ul>

      <p style="margin-top: 20px; font-size: 12px; color: #777;">
        <strong>Booked By Account:</strong> ${user.name} (${user.phone})
      </p>
    </div>
  `;

  return sendEmail({
    to: "amcareshealthorganization@gmail.com",
    subject: `📅 New Appointment: ${appointment.refCode}`,
    html,
  });
};

/**
 * Template for Organ Transplant Registration Confirmation
 */
const sendTransplantEmail = async (registration, user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Manrope', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #3D6080 0%, #14182D 100%); padding: 30px; text-align: center; color: white; }
        .content { padding: 30px; background: #fff; }
        .details-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3D6080; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; background: #f9f9f9; }
        .ref-code { font-family: monospace; font-size: 18px; color: #3D6080; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Transplant Registration Received</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Your organ transplant registration has been successfully recorded in our system. Here are your details:</p>
          
          <div class="details-box">
            <p><strong>Registration ID:</strong> <span class="ref-code">${registration.refCode}</span></p>
            <p><strong>Type:</strong> ${registration.type.toUpperCase()}</p>
            <p><strong>Organ:</strong> ${registration.organ.toUpperCase()}</p>
            <p><strong>Patient Name:</strong> ${registration.patientName}</p>
            <p><strong>Blood Group:</strong> ${registration.bloodGroup}</p>
            <p><strong>Urgency:</strong> ${registration.urgency.toUpperCase()}</p>
            <p><strong>Status:</strong> ACTIVE (AI Scanning NOTTO database)</p>
          </div>

          <p>Our AI is actively scanning the database for a compatible match. You'll be notified immediately via SMS and email the moment a match is found.</p>
          <p>Keep your phone accessible 24/7.</p>
          <p>Best regards,<br>The AmCaresHealth Team</p>
        </div>
        <div class="footer">
          &copy; 2026 AmCaresHealth. All rights reserved.<br>
          NOTTO Partnered
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: registration.email || user.email,
    subject: `Registration Confirmed: ${registration.refCode}`,
    html,
  });
};

/**
 * Send Notification Email to Organization for New Transplant Registration
 */
const sendTransplantNotification = async (registration, user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #3D6080;">New Transplant Registration</h2>
      <p>A new organ transplant registration has been submitted via the mobile app.</p>
      
      <h3 style="border-bottom: 1px solid #eee; padding-bottom: 8px;">Registration Details</h3>
      <ul style="list-style: none; padding-left: 0;">
        <li><strong>Ref Code:</strong> ${registration.refCode}</li>
        <li><strong>Type:</strong> ${registration.type.toUpperCase()}</li>
        <li><strong>Organ:</strong> ${registration.organ.toUpperCase()}</li>
        <li><strong>Patient Name:</strong> ${registration.patientName}</li>
        <li><strong>Age:</strong> ${registration.age}</li>
        <li><strong>Blood Group:</strong> ${registration.bloodGroup}</li>
        <li><strong>City:</strong> ${registration.city}</li>
        <li><strong>Urgency:</strong> ${registration.urgency.toUpperCase()}</li>
        <li><strong>Phone:</strong> ${registration.phone}</li>
        <li><strong>Email:</strong> ${registration.email}</li>
      </ul>

      <h3 style="border-bottom: 1px solid #eee; padding-bottom: 8px;">Medical History</h3>
      <p>${registration.medicalHistory || "N/A"}</p>

      <p style="margin-top: 20px; font-size: 12px; color: #777;">
        <strong>Registered By Account:</strong> ${user.name} (${user.email})
      </p>
    </div>
  `;

  return sendEmail({
    to: "amcareshealthorganization@gmail.com",
    subject: `🚨 New Transplant Req: ${registration.refCode} (${registration.organ.toUpperCase()})`,
    html,
  });
};

module.exports = {
  sendRegistrationEmail,
  sendRegistrationNotification,
  sendAppointmentEmail,
  sendAppointmentNotification,
  sendTransplantEmail,
  sendTransplantNotification,
};
