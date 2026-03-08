require("dotenv").config();
const nodemailer = require("nodemailer");

/**
 * Configure the SMTP transporter.
 * Uses environment variables for security.
 */
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Sends a deployment completion email to team members.
 * 
 * @param {Array<string>} emails - Array of recipient email addresses.
 * @param {Object} pipeline - The pipeline object containing project details.
 * @param {Object} manager - The manager who approved the release.
 */
const sendCompletionEmail = async (emails, pipeline, manager) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("SMTP credentials not configured. Skipping email notification.");
        return false;
    }

    if (!emails || emails.length === 0) {
        console.log("No recipient emails provided for notification.");
        return false;
    }

    const toList = emails.join(", ");
    const projectName = pipeline.project_name || "DeployFlow Project";

    const mailOptions = {
        from: `"DeployFlow Automation" <${process.env.SMTP_USER}>`,
        to: toList,
        subject: `🚀 SUCCESS: ${projectName} has been successfully deployed!`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Deployment Successful!</h1>
        </div>
        <div style="padding: 24px; color: #334155;">
          <p style="font-size: 16px; line-height: 1.5;">Hello Team,</p>
          <p style="font-size: 16px; line-height: 1.5;">
            Great news! The pipeline for <strong>${projectName}</strong> has successfully completed its final release stage.
          </p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0;"><strong>Pipeline Details:</strong></p>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
              <li><strong>Project:</strong> ${projectName}</li>
              <li><strong>Manager Approval:</strong> ${manager.name}</li>
              <li><strong>Status:</strong> LIVE in Production 🟢</li>
            </ul>
          </div>

          <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
            This is an automated message from your magical DeployFlow platform.
          </p>
        </div>
      </div>
    `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent to: ${toList}. Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("Failed to send completion email:", error);
        return false;
    }
};

module.exports = {
    sendCompletionEmail
};
