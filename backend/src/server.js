require("dotenv/config");

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const setupChatbotSocket = require("./modules/chatbot/chatbot.socket");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"]
  }
});

setupChatbotSocket(io);

server.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
