const { response, chat, chatStream } = require("../../lib/openai");
const { chatWithForumTools } = require("../ai/ai.orchestrator");
const { buildMcpContext } = require("../ai/ai.service");

async function getResponse(prompt) {
    return await response(prompt);
}

async function sendChat(messages) {
    return await chat(messages);
}

async function sendChatStream(messages, onToken) {
    return await chatStream(messages, onToken);
}

async function sendChatWithForumContext(messages, user) {
    if (!process.env.CHATBOT_API_KEY?.trim()) {
        const error = new Error("CHATBOT_API_KEY no está configurada en el servidor");
        error.statusCode = 503;
        throw error;
    }
    return chatWithForumTools(messages, buildMcpContext(user));
}

module.exports = {
    getResponse,
    sendChat,
    sendChatStream,
    sendChatWithForumContext,
};
