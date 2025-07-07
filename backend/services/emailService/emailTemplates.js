// services/emailService/emailTemplates.js

const newEventNotification = (eventName, eventDate, eventBeach, registrationDeadline, eventLink) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #007bff;">🎉 New Cleanup Event Alert!</h2>
        <p>Dear Volunteer,</p>
        <p>A new exciting beach cleanup event, <strong>${eventName}</strong>, has just been announced!</p>
        <ul style="list-style-type: none; padding: 0;">
            <li style="margin-bottom: 10px;"><strong>Event Date:</strong> ${new Date(eventDate).toLocaleDateString()}</li>
            <li style="margin-bottom: 10px;"><strong>Location:</strong> ${eventBeach}</li>
            <li style="margin-bottom: 10px;"><strong>Registration Deadline:</strong> ${new Date(registrationDeadline).toLocaleDateString()}</li>
        </ul>
        <p>Join us to make a real impact on our beautiful beaches!</p>
        <p style="text-align: center;">
            <a href="${eventLink}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">
                View Event & Register
            </a>
        </p>
        <p>Thank you for being part of the solution!</p>
        <p>Sincerely,<br>The Clean Mumbai Team</p>
    </div>
`;

const upcomingEventReminder = (eventName, eventDate, eventBeach, eventLink) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #ffc107;">🔔 Upcoming Event Reminder!</h2>
        <p>Dear Volunteer,</p>
        <p>Just a friendly reminder about the upcoming event you registered for:</p>
        <ul style="list-style-type: none; padding: 0;">
            <li style="margin-bottom: 10px;"><strong>Event Name:</strong> ${eventName}</li>
            <li style="margin-bottom: 10px;"><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</li>
            <li style="margin-bottom: 10px;"><strong>Location:</strong> ${eventBeach}</li>
        </ul>
        <p>We're excited to have you join us. Please prepare accordingly and arrive on time!</p>
        <p style="text-align: center;">
            <a href="${eventLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                Event Details
            </a>
        </p>
        <p>See you there!</p>
        <p>Sincerely,<br>The Clean Mumbai Team</p>
    </div>
`;

const eventCompletionReminder = (eventName, eventDate, eventLink) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #dc3545;">🚨 Action Required: Event Data Upload!</h2>
        <p>Dear Volunteer,</p>
        <p>The event <strong>${eventName}</strong> on ${new Date(eventDate).toLocaleDateString()} has recently concluded (or is about to!).</p>
        <p>To help us accurately measure our collective impact, please upload your waste collected data as soon as possible.</p>
        <p style="text-align: center;">
            <a href="${eventLink}" style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">
                Upload Waste Data
            </a>
        </p>
        <p>Your contribution is valuable, and your data ensures it's fully recognized!</p>
        <p>Sincerely,<br>The Clean Mumbai Team</p>
    </div>
`;

module.exports = {
    newEventNotification,
    upcomingEventReminder,
    eventCompletionReminder
};