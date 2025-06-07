const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Organizer Schema
const organizerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNo: { type: String, required: true },
  password: { type: String, required: true },
  affiliatedNgo: { type: String, required: true },
  eventHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  role: { type: String, default: 'admin' }
}, { timestamps: true });

organizerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

organizerSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Event Schema
const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateOfEvent: { type: Date, required: true },
  deadlineForRegistration: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  beachName: { type: String, required: true },
  beachLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  beachAddress: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizer', required: true },
  volunteerRegisterCount: { type: Number, default: 0 },
  refreshments: { type: Boolean, default: false },
  certificateOfParticipation: { type: Boolean, default: false },
  safetyProtocols: [{ type: String }],
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' },
  registeredVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' }]
}, { timestamps: true });

// Beach Schema
const beachSchema = new mongoose.Schema({
  beachName: { type: String, required: true, unique: true },
  beachLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  beachAddress: { type: String, required: true },
  totalWasteCollected: { type: Number, default: 0 },
  noOfEventsConduction: { type: Number, default: 0 }
}, { timestamps: true });

// Volunteer Schema
const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNo: { type: String, required: true },
  password: { type: String, required: true },
  address: { type: String },
  registrationDate: { type: Date, default: Date.now },
  participationHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  rewardPoints: { type: Number, default: 0 },
  achievements: [{ type: String }],
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  wasteCollected: { type: Number, default: 0 },
  role: { type: String, default: 'volunteer' }
}, { timestamps: true });

volunteerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

volunteerSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Impact Schema
const impactSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  totalWasteCollected: { type: Number, required: true },
  volunteerParticipationCount: { type: Number, required: true },
  co2OffsetEstimation: { type: Number }, // in kg
  wasteByType: [{
    type: { type: String, required: true },
    weight: { type: Number, required: true }
  }]
}, { timestamps: true });

// Waste Collected Schema
const wasteCollectedSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
  type: { type: String, required: true },
  weight: { type: Number, required: true },
  collectionDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Export models
module.exports = {
  Organizer: mongoose.model('Organizer', organizerSchema),
  Event: mongoose.model('Event', eventSchema),
  Beach: mongoose.model('Beach', beachSchema),
  Volunteer: mongoose.model('Volunteer', volunteerSchema),
  Impact: mongoose.model('Impact', impactSchema),
  WasteCollected: mongoose.model('WasteCollected', wasteCollectedSchema)
};