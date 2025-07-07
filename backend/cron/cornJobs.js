// cronJobs.js
const cron = require('node-cron');
const { Event, Volunteer, WasteCollected } = require('../models'); // Adjust path
const { sendUpcomingEventReminder, sendEventCompletionReminder } = require('../services/emailService');

const REMINDER_DAYS_BEFORE_EVENT = 3; // Days before event to send upcoming reminder
const REMINDER_DAYS_AFTER_EVENT = 1; // Days after event completion to send waste upload reminder

const setupNotificationCronJobs = () => {
    // Schedule a daily task (e.g., every day at 8:00 AM)
    console.log("Running secon corn")
    cron.schedule('0 8 * * *', async () => {
        console.log('Running daily event notification check...');
        const now = new Date();

        try {
            // --- Upcoming Event Reminders ---
            const upcomingEvents = await Event.find({
                status: 'upcoming',
                dateOfEvent: {
                    $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() + REMINDER_DAYS_BEFORE_EVENT),
                    $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + REMINDER_DAYS_BEFORE_EVENT + 1)
                }
            });

            for (const event of upcomingEvents) {
                for (const volunteerId of event.registeredVolunteers) {
                    const volunteer = await Volunteer.findById(volunteerId).select('email');
                    if (volunteer && volunteer.email) {
                        const eventLink = `http://yourfrontend.com/events/${event._id}`; // Frontend event detail page
                        await sendUpcomingEventReminder(volunteer.email, event, eventLink);
                    }
                }
            }
            console.log(`Sent upcoming event reminders for ${upcomingEvents.length} events.`);

            // --- Event Nearing Completion / Waste Upload Reminders ---
            // Find events that are ongoing or just completed recently
            const completedOrOngoingEvents = await Event.find({
                $or: [
                    { status: 'ongoing' },
                    {
                        status: 'completed',
                        endTime: {
                            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - REMINDER_DAYS_AFTER_EVENT),
                            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate()) // Within the last X days
                        }
                    }
                ]
            });

            for (const event of completedOrOngoingEvents) {
                for (const volunteerId of event.registeredVolunteers) {
                    // Check if the volunteer has uploaded waste data for this event
                    const hasUploadedWaste = await WasteCollected.findOne({
                        volunteerId: volunteerId,
                        eventId: event._id
                    });

                    if (!hasUploadedWaste) { // Only remind if no waste data uploaded
                        const volunteer = await Volunteer.findById(volunteerId).select('email');
                        if (volunteer && volunteer.email) {
                            const eventLink = `http://yourfrontend.com/events/${event._id}/upload-waste`; // Link to waste upload section
                            await sendEventCompletionReminder(volunteer.email, event, eventLink);
                        }
                    }
                }
            }
            console.log(`Sent waste upload reminders for relevant events.`);

        } catch (error) {
            console.error('Error in daily notification cron job:', error);
        }
    });
};

module.exports = setupNotificationCronJobs;