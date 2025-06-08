const express = require('express');
const { InferenceClient } = require("@huggingface/inference");
const { Event } = require('../models');

const router = express.Router();
const client = new InferenceClient(process.env.HF_TOKEN);

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // Get current events for context
    const upcomingEvents = await Event.find({ status: 'upcoming' })
      .populate('organizerId', 'name affiliatedNgo')
      .sort({ dateOfEvent: 1 })
      .limit(5);

    // Create context about available events
    const eventsContext = upcomingEvents.map(event => 
      `Event: ${event.name} at ${event.beachName} on ${new Date(event.dateOfEvent).toDateString()} from ${event.startTime} to ${event.endTime}. Registration deadline: ${new Date(event.deadlineForRegistration).toDateString()}. Refreshments: ${event.refreshments ? 'Yes' : 'No'}, Certificate: ${event.certificateOfParticipation ? 'Yes' : 'No'}.`
    ).join('\n');

    const systemPrompt = `You are a helpful beach cleanup assistant. Help volunteers with questions about beach cleanup events, safety protocols, and environmental conservation.

Current upcoming events:
${eventsContext}

Common FAQs:
- What to bring: Gloves, water bottle, hat, sunscreen, comfortable clothes
- Safety: Stay hydrated, wear protective gear, avoid sharp objects
- Waste segregation: Separate plastic, glass, metal, and organic waste
- Impact: Every piece of trash removed helps marine life and keeps beaches clean

Keep responses friendly, informative, and encouraging. If asked about specific events, refer to the current events listed above.`;

    const chatCompletion = await client.chatCompletion({
      model: "meta-llama/Llama-3.2-1B-Instruct",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    res.json({
      success: true,
      response: chatCompletion.choices[0].message.content
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sorry, I encountered an error. Please try again.' 
    });
  }
});

module.exports = router;