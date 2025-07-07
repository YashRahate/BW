// services/emailService/index.js
const { Client } = require('postmark'); // Import the Postmark client
const { POSTMARK_API_TOKEN, POSTMARK_FROM_EMAIL } = require('./emailConfig');
const { newEventNotification, upcomingEventReminder, eventCompletionReminder } = require('./emailTemplates');

// Initialize Postmark client
const postmarkClient = new Client(POSTMARK_API_TOKEN);

const sendEmail = async (to, subject, htmlContent) => {
    if (!POSTMARK_API_TOKEN || !POSTMARK_FROM_EMAIL) {
        console.error("Postmark API Token or FROM email is not configured. Cannot send email.");
        return; // Exit if not configured
    }

    try {
        const mailOptions = {
            From: POSTMARK_FROM_EMAIL, // Your verified Sender Signature email
            To: to,
            Subject: subject,
            HtmlBody: htmlContent,
            MessageStream: 'outbound' // Recommended for transactional emails in Postmark
            // You can add more options like TextBody, Tag, TrackOpens, etc.
        };

        const response = await postmarkClient.sendEmail(mailOptions);

        if (response.ErrorCode === 0) { // Postmark returns ErrorCode 0 for success
            console.log(`Email successfully sent to ${to} for subject: ${subject}`);
            // console.log("Postmark API Response:", response); // Log full response for debugging
        } else {
            console.error(`Postmark API responded with error for email to ${to}:`, response.Message);
            throw new Error(`Postmark API error: ${response.Message} (Code: ${response.ErrorCode})`);
        }
    } catch (error) {
        console.error(`Failed to send email to ${to} for subject: ${subject} via Postmark:`, error.response?.data || error.message);
        // If using axios directly to Postmark API, error.response?.data would be relevant.
        // For Postmark client, error.message often contains relevant details.
    }
};

// These functions remain the same, they just call the updated sendEmail
const sendNewEventNotification = async (volunteerEmail, eventDetails, eventLink) => {
    const subject = `New Beach Cleanup Event: ${eventDetails.name}!`;
    const html = newEventNotification(
        eventDetails.name,
        eventDetails.dateOfEvent,
        eventDetails.beachName,
        eventDetails.deadlineForRegistration,
        eventLink
    );
    await sendEmail(volunteerEmail, subject, html);
};

const sendUpcomingEventReminder = async (volunteerEmail, eventDetails, eventLink) => {
    const subject = `Reminder: Your Event "${eventDetails.name}" is Coming Soon!`;
    const html = upcomingEventReminder(
        eventDetails.name,
        eventDetails.dateOfEvent,
        eventDetails.beachName,
        eventLink
    );
    await sendEmail(volunteerEmail, subject, html);
};

const sendEventCompletionReminder = async (volunteerEmail, eventDetails, eventLink) => {
    const subject = `Action Required: Upload Waste Data for "${eventDetails.name}"!`;
    const html = eventCompletionReminder(
        eventDetails.name,
        eventDetails.dateOfEvent,
        eventLink
    );
    await sendEmail(volunteerEmail, subject, html);
};

module.exports = {
    sendNewEventNotification,
    sendUpcomingEventReminder,
    sendEventCompletionReminder
};