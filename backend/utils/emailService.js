const nodemailer = require('nodemailer');

/**
 * Creates nodemailer transporter if env variables exist, otherwise returns a mock transporter
 */
const getTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
};

/**
 * Send Email Notification to Substitute Faculty
 */
const sendSubstituteNotificationEmail = async ({
  toEmail,
  facultyName,
  date,
  day,
  startTime,
  endTime,
  subject,
  department,
  className,
  division,
  room,
  originalFacultyName
}) => {
  const mailSubject = `[TSDC Smart Schedule] Substitute Lecture Assignment - ${subject} (${date})`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); padding: 24px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">THAKUR SHYAMNARAYAN DEGREE COLLEGE</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Smart Schedule AI & Workload Management System</p>
      </div>

      <div style="padding: 24px;">
        <h3 style="color: #1e293b; margin-top: 0; font-size: 18px;">Substitute Lecture Notification</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">
          Hello <strong>${facultyName}</strong>,
        </p>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">
          You have been assigned as a substitute teacher for an upcoming lecture due to faculty absence. Below are the details of your assigned lecture:
        </p>

        <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Date & Day:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${date} (${day})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Time Slot:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #2563eb;">${startTime} – ${endTime}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Subject:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Class / Div:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${className} Div ${division}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Room / Location:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #d97706;">Room ${room}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Replacing:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #e11d48;">${originalFacultyName}</td>
            </tr>
          </table>
        </div>

        <p style="color: #475569; font-size: 13px; line-height: 1.5;">
          This assignment has automatically updated the official timetable. Please arrive at Room ${room} on time.
        </p>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
          This is an automated notification from TSDC Smart Schedule AI.
        </div>
      </div>
    </div>
  `;

  try {
    const transporter = getTransporter();
    if (transporter) {
      const info = await transporter.sendMail({
        from: `"TSDC Smart Schedule AI" <${process.env.SMTP_FROM || 'noreply@tsdc.edu.in'}>`,
        to: toEmail,
        subject: mailSubject,
        html: htmlContent
      });
      console.log(`[Email Sent] MessageId: ${info.messageId} to ${toEmail}`);
      return { success: true, messageId: info.messageId, simulated: false };
    } else {
      // Clean console log fallback when SMTP is not configured
      console.log(`\n==================================================`);
      console.log(`[SIMULATED EMAIL NOTIFICATION SENT]`);
      console.log(`To: ${toEmail} (${facultyName})`);
      console.log(`Subject: ${mailSubject}`);
      console.log(`Lecture: ${subject} | ${date} (${day}) ${startTime}-${endTime} in Room ${room}`);
      console.log(`==================================================\n`);
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error(`[Email Error] Failed to send email to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSubstituteNotificationEmail
};
