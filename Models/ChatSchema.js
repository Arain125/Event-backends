const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatSchema = new Schema({
    participants: [
        { type: mongoose.Schema.Types.ObjectId, ref: "user" } // User references
    ],
    messages: [
        {
            sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

const chatModel = mongoose.model("chat", chatSchema);
module.exports = chatModel;
