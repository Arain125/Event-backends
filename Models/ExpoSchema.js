const mongoose = require('mongoose');

const expoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  imgUrl: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  booth: {
    type: Number, // Total number of booths
    required: true
  },
  assignedBooths: [
    {
      boothNumber: Number,
      exhibitor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user' // Or use 'Expo' if exhibitorList is embedded
      }
    }
  ],
  boothRequests: [
    {
      boothNumber: Number,
      exhibitor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      requestedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  time: {
    type: String,
    required: false,
    default: 'TBD'
  },
  speaker: {
    type: String,
    required: true,
    default: 'TBD'
  },
  attendeeList: [
    {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      }
    }
  ],
  exhibitorList: [
    {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      companyName: {
        type: String,
        required: true
      },
      productsServices: {
        type: String,
        required: true
      },
      documents: {
        type: String,
        required: true
      }
    }
  ],
  exhibitorRequests: [
    {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      companyName: {
        type: String,
        required: true
      },
      productsServices: {
        type: String,
        required: true
      },
      documents: {
        type: String,
        required: true
      }
    }
  ]
});


// Virtuals for counts
expoSchema.virtual('attendeeCount').get(function () {
  return this.attendeeList.length;
});

expoSchema.virtual('exhibitorCount').get(function () {
  return this.exhibitorList.length;
});

expoSchema.virtual('assignedBoothCount').get(function () {
  return this.assignedBooths?.length || 0;
});

expoSchema.virtual('availableBoothCount').get(function () {
  return this.availableBooths?.length || 0;
});

// Ensure virtuals are included in JSON and Object outputs
expoSchema.set('toJSON', { virtuals: true });
expoSchema.set('toObject', { virtuals: true });

const ExpoModal = mongoose.model('Expo', expoSchema);

module.exports = ExpoModal;
