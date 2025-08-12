import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
// --- IMPORT THE DATABASE LOGIC ---
import { handleNewMessage } from "./controllers/messageController.js";

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "https://yap-yard-frontend.vercel.app", // Your frontend URL
    credentials: true,
  },
});

export const userSocketMap = {}; // Maps { userId: socketId }

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // --- CORRECTED "sendMessage" LISTENER ---
  socket.on("sendMessage", async (messageData) => {
    try {
      // 1. Add senderId to the message data
      const messageWithSender = { ...messageData, senderId: userId };
      
      // 2. Save message to DB and get the full message back
      const savedMessage = await handleNewMessage(messageWithSender);

      // 3. Emit message to the receiver (if online)
      const receiverSocketId = userSocketMap[savedMessage.receiverId.toString()];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", savedMessage);
      }
      
      // 4. Emit message back to the sender to update their own UI
      socket.emit("newMessage", savedMessage);

    } catch (error) {
      console.error("Error handling and saving message:", error);
      // Optional: notify sender of the error
      socket.emit("messageError", { error: "Message could not be sent or saved." });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

await connectDB();

app.use(express.json({ limit: "4mb" }));
app.use(
  cors({
    origin: "https://yap-yard-frontend.vercel.app", // Your frontend URL
    credentials: true,
  })
);

app.use("/api/status", (req, res) => res.send("server is live"));
app.use("/api/messages", messageRouter);
app.use("/api/auth", userRouter);

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running and listening on port ${PORT}`);
});