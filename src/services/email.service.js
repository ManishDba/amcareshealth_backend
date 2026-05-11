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
        .header { background: linear-gradient(135deg, #8B2635 0%, #5E1A24 100%); padding: 30px; text-align: center; color: white; }
        .content { padding: 30px; background: #fff; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #8B2635; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
        .welcome-msg { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #8B2635; }
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
        .header { background: linear-gradient(135deg, #2D3E50 0%, #1A252F 100%); padding: 30px; text-align: center; color: white; }
        .content { padding: 30px; background: #fff; }
        .details-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B2635; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; background: #f9f9f9; }
        .ref-code { font-family: monospace; font-size: 18px; color: #8B2635; font-weight: bold; }
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
      <h2>New Appointment Booked</h2>
      <p>A new appointment has been scheduled.</p>
      <ul>
        <li><strong>Ref Code:</strong> ${appointment.refCode}</li>
        <li><strong>Patient:</strong> ${user.name}</li>
        <li><strong>Doctor:</strong> ${doctor.name}</li>
        <li><strong>Date:</strong> ${appointment.date}</li>
        <li><strong>Time:</strong> ${appointment.time}</li>
      </ul>
    </div>
  `;

  return sendEmail({
    to: "amcareshealthorganization@gmail.com",
    subject: `📅 New Appointment: ${appointment.refCode}`,
    html,
  });
};

module.exports = {
  sendRegistrationEmail,
  sendRegistrationNotification,
  sendAppointmentEmail,
  sendAppointmentNotification,
};
