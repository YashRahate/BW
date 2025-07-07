const cron = require('node-cron');
const {Event,generateImpactData} = require('../models'); // adjust path as needed
// import { generateImpactData } from '../models';

// Helper to get Date+Time object
function getDateTime(date, time) {
  const [hours, minutes] = time.split(':');
  const dateTime = new Date(date);
  dateTime.setHours(+hours, +minutes, 0, 0);
  return dateTime;
}

// Runs every 10 minutes (adjust as needed)
cron.schedule('*/10 * * * *', async () => {
  console.log('Running event status update cron job...');

  try {
    
    const events = await Event.find({}); // you can filter upcoming/ongoing only for optimization

    const completedevents = await Event.find({status:'completed'});
    for (completedevent of completedevents){
      await generateImpactData(completedevent._id);
            
    }


    const now = new Date();

    for (let event of events) {
      const eventDate = new Date(event.dateOfEvent);
      const startDateTime = getDateTime(eventDate, event.startTime);
      const endDateTime = getDateTime(eventDate, event.endTime);

      let newStatus = event.status;

      if (now < startDateTime) {
        newStatus = 'upcoming';
      } else if (now >= startDateTime && now <= endDateTime) {
        newStatus = 'ongoing';
      } else if (now > endDateTime) {
        newStatus = 'completed';
      }

      // Only update if status actually changed
      if (event.status !== newStatus) {
        event.status = newStatus;
        await event.save();
        console.log(`Updated event '${event.name}' to status: ${newStatus}`);
      }
    }

    console.log('Event status update job finished.');
  } catch (err) {
    console.error('Error running event status cron job:', err);
  }
});
