const mongoose = require('mongoose');

const boothSchema = new mongoose.Schema({
  boothId: {
    type: String,
    unique: true
  },
  x: { type: Number },   // optional, for floor plan UI
  y: { type: Number },   // optional
  width: { type: Number, default: 1 },  // optional
  height: { type: Number, default: 1 }, // optional
  status: {
    type: String,
    enum: ['available', 'assigned'],
    default: 'available'
  },
  assignedToEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null
  }
});

const Booth = mongoose.model('Booth', boothSchema);
module.exports = Booth;
