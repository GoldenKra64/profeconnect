const jwt = require("jsonwebtoken");
const prisma = require("../../lib/prisma");
const { sendChat, sendChatStream, sendChatWithForumContext } = require("./chatbot.service");

function setupChatbotSocket(io) {
    const chatNamespace = io.of("/chatbot");

    chatNamespace.on("connection", (socket) => {
        console.log(`Cliente conectado al chatbot: ${socket.id}`);

        async function resolveSocketUser() {
            const token = socket.handshake.auth?.token;
            if (!token) return null;
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await prisma.user.findUnique({
                    where: { id: decoded.userId },
                    include: { role: true },
                });
                if (!user || user.status !== "ACTIVO" || !user.role?.active) {
                    return null;
                }
                return { id: user.id, role: user.role.name };
            } catch {
                return null;
            }
        }

        async function handleForumOrChat(data, streamMode) {
            const { messages, useForumTools } = data;

            if (!messages || !Array.isArray(messages) || messages.length === 0) {
                socket.emit("chat:error", { message: "Se requiere un array de mensajes" });
                return;
            }

            if (useForumTools) {
                const user = await resolveSocketUser();
                if (!user) {
                    socket.emit("chat:error", {
                        message: "Inicia sesión para consultar las publicaciones del foro",
                    });
                    return;
                }
                try {
                    const response = await sendChatWithForumContext(messages, user);
                    if (streamMode) {
                        socket.emit("chat:response", { message: response });
                        socket.emit("chat:done");
                    } else {
                        socket.emit("chat:response", { message: response });
                    }
                } catch (err) {
                    console.error(err);
                    socket.emit("chat:error", {
                        message: err.message || "Error al consultar el foro con IA",
                    });
                }
                return;
            }

            if (streamMode) {
                try {
                    await sendChatStream(messages, (token) => {
                        socket.emit("chat:token", { token });
                    });
                    socket.emit("chat:done");
                } catch (err) {
                    console.error(err);
                    socket.emit("chat:error", { message: "Error en el stream de la IA" });
                }
            } else {
                try {
                    const response = await sendChat(messages);
                    socket.emit("chat:response", { message: response });
                } catch (err) {
                    console.error(err);
                    socket.emit("chat:error", { message: "Error al obtener respuesta de la IA" });
                }
            }
        }

        socket.on("chat:message", (data) => handleForumOrChat(data, false));
        socket.on("chat:stream", (data) => handleForumOrChat(data, true));
        socket.on("chat:forum", (data) => handleForumOrChat({ ...data, useForumTools: true }, false));

        socket.on("disconnect", () => {
            console.log(`Cliente desconectado del chatbot: ${socket.id}`);
        });
    });
}

module.exports = setupChatbotSocket;
