const chatModel = require("../Models/ChatSchema");

const chatController = {
    createOrGetChat: async (req, res) => {
        const { userId, participantId } = req.body;
        try {
            let chat = await chatModel.findOne({
                participants: { $all: [userId, participantId] }
            }).populate("participants", "name email");

            if (!chat) {
                chat = await chatModel.create({ participants: [userId, participantId] });
            }

            res.status(200).json({ message: "Chat found or created", chat });
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    },
    sendMessage:async (req, res) => {
        const { chatId, senderId, content } = req.body;
    
        try {
            const chat = await chatModel.findByIdAndUpdate(
                chatId,
                { $push: { messages: { sender: senderId, content } } },
                { new: true }
            ).populate("messages.sender", "name");
    
            res.status(200).json({ message: "Message sent", chat });
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    },
    getUserChats:async (req, res) => {
        try {
            const chats = await chatModel.find({
                participants: req.params.userId
            }).populate("participants", "name email").populate("messages.sender", "name");
    
            res.status(200).json({ message: "Chats fetched", chats });
        } catch (error) {
            res.status(500).json({ message: "Server error", error });
        }
    }
}

module.exports = chatController;