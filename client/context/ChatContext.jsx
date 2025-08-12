import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    // --- Get user and socket from AuthContext ---
    const { user: currentUser, socket, axios } = useContext(AuthContext);

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

    // --- sendMessage function only needs to emit the event ---
    const sendMessage = async (messageData) => {
        if (!socket) {
            toast.error("Socket not connected.");
            return;
        }
        // The server now handles saving the message.
        // We only need to tell the server who the receiver is.
        socket.emit("sendMessage", {
            ...messageData,
            receiverId: selectedUser._id,
        });
    };

    useEffect(() => {
        if (!socket) return;

        // --- CORRECTED "newMessage" LISTENER ---
        const handleNewMessage = (newMessage) => {
            // Check if the message belongs to the currently open chat
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                // If chat is open, add message to view and mark as seen
                setMessages((prev) => [...prev, newMessage]);
                // Optionally, inform the server it's been seen immediately
                axios.put(`/api/messages/mark/${newMessage._id}`).catch(err => console.error("Failed to mark message as seen", err));

            } else if (newMessage.senderId !== currentUser._id) {
                // If chat is NOT open and message is from someone else, increment unseen count
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
                }));
                toast.info(`New message from another user!`);
            } else {
                // This is our own message that we sent, add it to the UI
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        socket.on("newMessage", handleNewMessage);

        // Clean up the listener on component unmount
        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket, selectedUser, currentUser, axios]);


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
        setMessages, // Export setMessages to clear chat when user is deselected
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatProvider;