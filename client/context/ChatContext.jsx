import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    // --- FIX: Correctly destructure `authUser` from context ---
    const { authUser: currentUser, socket, axios } = useContext(AuthContext);

    const getUsers = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.filteredUsers);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }, [axios]);

    // --- FIX: Wrap functions in `useCallback` to prevent unnecessary re-renders ---
    const getMessages = useCallback(async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }, [axios]);

    const sendMessage = useCallback(async (messageData) => {
        if (!socket) {
            toast.error("Socket not connected.");
            return;
        }
        socket.emit("sendMessage", {
            ...messageData,
            receiverId: selectedUser?._id,
        });
    }, [socket, selectedUser]);

    useEffect(() => {
        if (!socket || !currentUser) return; // Added safety check for currentUser

        const handleNewMessage = (newMessage) => {
            // --- FIX: Compare sender ID using the `_id` property from the populated object ---
            const senderId = newMessage.senderId._id || newMessage.senderId;

            // Check if the message belongs to the currently open chat
            if (selectedUser && senderId === selectedUser._id) {
                setMessages((prev) => [...prev, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`).catch(err => console.error("Failed to mark message as seen", err));

            } else if (senderId !== currentUser._id) {
                // If chat is NOT open and message is from someone else, increment unseen count
                setUnseenMessages((prev) => ({
                    ...prev,
                    [senderId]: (prev[senderId] || 0) + 1,
                }));
                toast.info(`New message from another user!`);
            } else {
                // This is our own message that we sent, add it to the UI
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket, selectedUser, currentUser, axios, getMessages]);


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
        setMessages,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatProvider;