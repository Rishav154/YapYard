import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";

// --- NEW FUNCTION FOR SOCKET SERVER TO SAVE MESSAGES ---
export const handleNewMessage = async (messageData) => {
    const { senderId, receiverId, text, image } = messageData;

    let imageUrl;
    if (image) {
        const uploadResponse = await cloudinary.uploader.upload(image, {
            resource_type: "auto",
        });
        imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
        senderId,
        receiverId,
        text,
        image: imageUrl,
    });
    
    await newMessage.save();

    // We populate the sender's details to send the complete data to clients
    const fullMessage = await Message.findById(newMessage._id).populate("senderId", "username profilePic");

    return fullMessage;
};

// --- This is your existing API route handler ---
// It can now optionally use the function above to reduce code duplication
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        const newMessage = await handleNewMessage({ senderId, receiverId, text, image });

        res.status(201).json({ success: true, newMessage });

    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// getUsersForSidebar function remains the same...
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");
        const unseenMessages = {};
        const promises = filteredUsers.map(async (user) => {
            const count = await Message.countDocuments({
                senderId: user._id,
                receiverId: userId,
                seen: false,
            });
            if (count > 0) {
                unseenMessages[user._id] = count;
            }
        });
        await Promise.all(promises);
        res.json({ success: true, filteredUsers, unseenMessages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// getMessages function remains the same...
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId },
            ],
        }).populate("senderId", "username profilePic"); // Populate sender info here too
        
        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId, seen: false },
            { seen: true }
        );
        res.json({ success: true, messages });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// markMessageAsSeen function remains the same...
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true });
        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};