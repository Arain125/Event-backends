const { Schema, default: mongoose } = require("mongoose");

const feedbackSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expo", // assuming your event model is named "Expo"
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

const feedbackModel = mongoose.model("Feedback", feedbackSchema);
module.exports = feedbackModel;
