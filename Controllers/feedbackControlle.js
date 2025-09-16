const mongoose = require("mongoose");
const feedbackModel = require("../Models/FeedbackSchema");

const feedbackController = {
  // GET: All feedbacks (optional use)
  getAllFeedbacks: async (req, res) => {
     try {
    const { id } = req.params;

    // Fetch feedbacks only related to the provided event ID
    const feedbacks = await feedbackModel.find({ eventId: id }).sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      data: feedbacks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: "Internal server error" });
  }
  },

  // GET: Feedbacks for a specific event
  getFeedbacksByEventId: async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "Invalid event ID" });
    }

    try {
      const feedbacks = await feedbackModel
        .find({ eventId: id })
        .sort({ createdAt: -1 });

      res.status(200).json({ status: true, data: feedbacks });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: false, error: "Internal server error" });
    }
  },

  // POST: Create or update feedback
  createFeedback: async (req, res) => {
    try {
      const { name, email, message, eventId } = req.body;

      if (!name || !email || !message || !eventId) {
        return res.status(400).json({
          status: false,
          error: "All fields (name, email, message, eventId) are required",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ status: false, message: "Invalid event ID" });
      }

      // Check for existing feedback by email for this event
      const existingFeedback = await feedbackModel.findOne({ email, eventId });

      if (existingFeedback) {
        existingFeedback.name = name;
        existingFeedback.message = message;
        await existingFeedback.save();

        return res.status(200).json({
          message: "Feedback updated successfully",
          feedback: existingFeedback,
          status: true,
        });
      } else {
        const feedback = new feedbackModel({ name, email, message, eventId });
        await feedback.save();

        return res.status(201).json({
          message: "Feedback created successfully",
          feedback,
          status: true,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: false, error: "Internal server error" });
    }
  },
};

module.exports = feedbackController;
