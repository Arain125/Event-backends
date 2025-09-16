const express = require("express")
const chatController = require("../Controllers/chatController")

const router = express.Router()

router.post("/", chatController.createOrGetChat)
router.post("/message",chatController.sendMessage)
router.get("/chats/:userId", chatController.getUserChats)
module.exports = router

