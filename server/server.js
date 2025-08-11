import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// Initialise socket.io server with specific CORS options
export const io = new Server(server, {
  cors: {
    origin: "https://yap-yard-frontend.vercel.app",
    credentials: true,
  },
});

// Store online users
export const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("A user connected:", userId);
  if (userId) userSocketMap[userId] = socket.id;

  // Send the updated list of online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // --- THIS IS THE KEY REAL-TIME LOGIC ---
  // Listen for a "sendMessage" event from a client
  socket.on("sendMessage", (message) => {
    const { receiverId, ...messageData } = message;
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      // If the receiver is online, send the "newMessage" event to them
      io.to(receiverSocketId).emit("newMessage", messageData);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId];
    // Send the updated list of online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

await connectDB();

app.use(express.json({ limit: "4mb" }));

// Use cors with specific options for Express
app.use(
  cors({
    origin: "https://yap-yard-frontend.vercel.app",
    credentials: true,
  })
);

app.use("/api/status", (req, res) => res.send("server is live"));
app.use("/api/messages", messageRouter);
app.use("/api/auth", userRouter);

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

// Start the server in all environments. Railway provides the PORT.
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running and listening on port ${PORT}`);
});