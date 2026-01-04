const mongoose = require('mongoose');

// Schema for individual email open events
const openEventSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  userAgent: {
    type: String,
    default: 'Unknown'
  },
  ip: {
    type: String,
    default: 'Unknown'
  },
  isSelf: {
    type: Boolean,
    default: false
  }
});

// Main tracking schema
const trackingSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  emailSubject: {
    type: String,
    required: true
  },
  recipient: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  senderIp: {
    type: String,
    default: 'Unknown'
  },
  opens: [openEventSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual field for open count
trackingSchema.virtual('openCount').get(function() {
  return this.opens.length;
});

// Virtual field for first open time
trackingSchema.virtual('firstOpenAt').get(function() {
  return this.opens.length > 0 ? this.opens[0].timestamp : null;
});

// Virtual field for last open time
trackingSchema.virtual('lastOpenAt').get(function() {
  return this.opens.length > 0 ? this.opens[this.opens.length - 1].timestamp : null;
});

// Include virtuals when converting to JSON
trackingSchema.set('toJSON', { virtuals: true });
trackingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Tracking', trackingSchema);
