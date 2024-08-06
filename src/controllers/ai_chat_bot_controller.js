const OpenAI = require('openai');

const AppError = require("../utils/app_error");
const HttpStatusCodes = require("../utils/http_status_codes");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function aiChat(userInput) {
    try {
        const chatCompletion = await openai.chat.completions.create(
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful health mate AI assistant. You can only answer to health and habit related questions' },
                    { role: 'user', content: userInput }
                ],
                temperature: 1,
                max_tokens: 150,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            }
        );

        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error('Error creating chat completion:', error);
        throw new Error('Failed to create chat completion');
    }
}
const aiChatController = async (req, res, next) => {
    const userInput = req.body.message;

    if (!userInput) {
        return res.status(HttpStatusCodes.BAD_REQUEST).send({
            message: 'Please enter a message',
        });
    }

    try {
        const message = await aiChat(userInput);
        res.status(HttpStatusCodes.OK).json({
            status: 'success',
            data: { 
                message
            }
        });
    } catch (error) {
        console.error('Error in aiChatController:', error);
        const err = new AppError('Error sending message', HttpStatusCodes.INTERNAL_SERVER_ERROR);
        next(err);
    }

}

module.exports = aiChatController;