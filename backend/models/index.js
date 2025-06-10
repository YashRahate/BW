const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');



async function generateImpactData(eventId) {
  try {
    const { Event, WasteCollected, WasteInformation,Impact } = require('../models');

    // 1. Get event data
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // 2. Get all waste collected for this event
    const wasteCollectedData = await WasteCollected.find({ eventId });

    // 3. Calculate totalWasteCollected
    const totalWasteCollected = wasteCollectedData.reduce((sum, waste) => sum + waste.weight, 0);

    // 4. Get volunteerParticipationCount from event
    const volunteerParticipationCount = event.volunteerRegisterCount || 0;

    // 5. Group waste by category and type for wasteByType array
    const wasteByTypeMap = {};
    wasteCollectedData.forEach(waste => {
      const key = `${waste.category}-${waste.type}`;
      if (!wasteByTypeMap[key]) {
        wasteByTypeMap[key] = {
          category: waste.category,
          type: waste.type,
          weight: 0
        };
      }
      wasteByTypeMap[key].weight += waste.weight;
    });
    const wasteByType = Object.values(wasteByTypeMap);

    // 6. Calculate CO2 offset estimation
    let co2OffsetEstimation = 0;
    
    // Get waste information data for CO2 calculation
    const wasteInfoData = await WasteInformation.find({});
    const wasteInfoMap = {};
    wasteInfoData.forEach(info => {
      const key = `${info.category}-${info.subcategory}`;
      wasteInfoMap[key] = info;
    });

    // Calculate CO2 offset for each waste type
    wasteByType.forEach(waste => {
      const key = `${waste.category}-${waste.type}`;
      const wasteInfo = wasteInfoMap[key];
      
      if (wasteInfo && wasteInfo.carbon_footprint_per_kg) {
        // CO2 offset = weight * carbon_footprint_per_kg
        co2OffsetEstimation += waste.weight * wasteInfo.carbon_footprint_per_kg;
      }
    });

    // Round to 2 decimal places
    co2OffsetEstimation = Math.round(co2OffsetEstimation * 100) / 100;


    // Find existing impact or create new one
        let impact = await Impact.findOne({ eventId });
        if (impact) {
          return;
        } else {
          impact = new Impact({
            eventId,
            totalWasteCollected,
            volunteerParticipationCount,
            co2OffsetEstimation,
            wasteByType
          });
        }

    await impact.save();
    console.log(`Impact data generated successfully for event ${eventId}`);
    
    return impact;
  } catch (error) {
    console.error('Error generating impact data:', error);
    throw error;
  }
}


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
    category:{ type: String, required: true },
    type: { type: String, required: true },
    weight: { type: Number, required: true }
  }]
}, { timestamps: true });

// Waste Collected Schema
const wasteCollectedSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
  category:{ type: String, required: true },
  type: { type: String, required: true },
  weight: { type: Number, required: true },
  bagCount: { type: Number, required: true },
  collectionDate: { type: Date, default: Date.now }
}, { timestamps: true });

const wasteInformationSchema = new mongoose.Schema({
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  decomposition_time_days: { type: Number },
  environmental_impact_score: { type: Number },
  marine_life_threat_level: { type: Number },
  recyclable: { type: Boolean },
  carbon_footprint_per_kg: { type: Number },
  safety_handling_instructions: { type: String },
  global_statistics: { type: String }
}, { collection: 'wasteinformation' }); // Specify the collection name



// Export models
module.exports = {
  Organizer: mongoose.model('Organizer', organizerSchema),
  Event: mongoose.model('Event', eventSchema),
  Beach: mongoose.model('Beach', beachSchema),
  Volunteer: mongoose.model('Volunteer', volunteerSchema),
  Impact: mongoose.model('Impact', impactSchema),
  WasteCollected: mongoose.model('WasteCollected', wasteCollectedSchema),
  WasteInformation:mongoose.model('WasteInformation', wasteInformationSchema),
  generateImpactData

};