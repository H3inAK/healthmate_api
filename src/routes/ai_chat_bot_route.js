const express = require('express');
const aiChatController = require('../controllers/ai_chat_bot_controller');

const aiChatBotRouter = express.Router();
aiChatBotRouter.post('/', aiChatController);

module.exports = aiChatBotRouter