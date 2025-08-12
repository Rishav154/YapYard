import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const { socket, axios } = useContext(AuthContext);

    // getUsers function remains the same...
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.filteredUsers);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // getMessages function remains the same...
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // --- THIS FUNCTION IS NOW CORRECTED ---
    const sendMessage = async (messageData) => {
        if (!socket) {
            toast.error("Socket not connected.");
            return;
        }

        // The ONLY responsibility of this function now is to emit the event.
        // The server will save the message and broadcast it back to update the UI.
        socket.emit("sendMessage", {
            ...messageData,
            receiverId: selectedUser._id,
        });
    };

    // subscribeToMessages function remains the same...
    const subscribeToMessages = () => {
        if (!socket) return;
        socket.on("newMessage", (newMessage) => {
            // This now handles messages for BOTH the sender and receiver
            setMessages((prev) => [...prev, newMessage]);

            if (selectedUser && newMessage.sender._id === selectedUser._id) {
                // Logic for when the receiver has the chat open
                newMessage.seen = true;
                axios.put(`/api/messages/mark/${newMessage._id}`);
            } else if (newMessage.senderId !== socket.id) { 
                // Logic for unseen messages when chat is not open
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
                }));
            }
        });
    };
    
    // unsubscribeFromMessages function remains the same...
    const unsubscribeFromMessages = () => {
        if (socket) socket.off("newMessage");
    };

    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [socket, selectedUser]);

    const value = {
        messages,
        users,
        selectedUser,
        unseenMessages,
        getUsers,
        setSelectedUser,
        setUnseenMessages,
        getMessages,
        sendMessage,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatProvider;