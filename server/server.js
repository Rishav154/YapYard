import express from "express"
import cors from "cors"
import "dotenv/config"
import http from "http"
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";


const app = express()
const server = http.createServer(app)


//initialise socket.io server
export const io= new Server(server, {
    cors:{origin:"*"}
})

//store online user
export const userSocketMap= {};

io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("user connected", userId);
    if(userId) userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on("disconnect", ()=>{
        console.log("user disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })


})

await connectDB();


app.use(express.json({limit: "4mb"}));

app.use(cors());
app.use("/api/status", (req,res)=> res.send("server is live"));
app.use("/api/messages", messageRouter);
app.use("/api/auth", userRouter);
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

if(process.env.NODE_ENV !== "production"){
  const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=> console.log(`server is running on port ${PORT}`));
}

export default server;