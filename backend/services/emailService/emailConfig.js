// services/emailService/emailConfig.js
require('dotenv').config(); // Load environment variables

// Postmark API configuration
// IMPORTANT: Store your Postmark API Token securely in environment variables!
const POSTMARK_API_TOKEN = process.env.POSTMARK_API_TOKEN || 'cd99de25-2434-434d-8f32-b85359de5532'; // !! REPLACE THIS WITH ENV VAR ONLY !!
const POSTMARK_FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL || '2022.sharvari.more@ves.ac.in'; // This is your verified Sender Signature email

if (!POSTMARK_API_TOKEN || POSTMARK_API_TOKEN === 'cd99de25-2434-434d-8f32-b85359de5532') {
    console.warn("WARNING: POSTMARK_API_TOKEN is not set in environment variables or is default. Please secure it.");
}
if (!POSTMARK_FROM_EMAIL || POSTMARK_FROM_EMAIL === '2022.sharvari.more@ves.ac.in') {
    console.warn("WARNING: POSTMARK_FROM_EMAIL is not set in environment variables or is default. Ensure this is your verified Sender Signature.");
}

module.exports = {
    POSTMARK_API_TOKEN,
    POSTMARK_FROM_EMAIL
};