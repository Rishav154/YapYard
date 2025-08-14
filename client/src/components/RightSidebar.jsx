import React, { useEffect, useState, useContext } from 'react';
import assets from '../assets/assets';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';

const RightSidebar = () => {
    const {
        selectedUser,
        messages,
        isRightSidebarOpen,
        setIsRightSidebarOpen
    } = useContext(ChatContext);
    const { logout, onlineUsers } = useContext(AuthContext);
    const [msgImages, setMsgImages] = useState([]);

    useEffect(() => {
        // Ensure messages is an array before filtering
        if (Array.isArray(messages)) {
            setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
        }
    }, [messages]);

    if (!selectedUser) {
        return null;
    }

    return (
        <div
            className={`
                text-white w-full h-full overflow-y-scroll transition-transform duration-300 ease-in-out
                transform-gpu
                md:relative md:translate-x-0 md:border-l md:border-white/10 md:block
                ${isRightSidebarOpen
                    ? 'block absolute top-0 right-0 z-30 w-4/5 max-w-[320px] bg-black/80 backdrop-blur-xl translate-x-0 rounded-2xl shadow-lg'
                    : 'hidden -translate-x-full'
                }
            `}
        >
            {/* Close button for mobile overlay view */}
            <div className="md:hidden absolute top-4 right-4 z-40">
                <img
                    onClick={() => setIsRightSidebarOpen(false)}
                    src={assets.close_icon} // Ensure you have this asset
                    alt="Close"
                    className="w-9 h-6 cursor-pointer"
                />
            </div>

            <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto text-center">
                <img
                    src={selectedUser?.profilePic || assets.avatar_icon}
                    alt=""
                    className="w-20 aspect-square object-cover rounded-full"
                />
                <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
                    {onlineUsers.includes(selectedUser._id) && (
                        <p className="w-2 h-2 rounded-full bg-green-500"></p>
                    )}
                    {selectedUser.fullName}
                </h1>
                <p className="px-10 mx-auto">{selectedUser.bio}</p>
            </div>
            <hr className="border-white/20 my-4" />
            <div className="px-5 text-xs">
                <p>Media</p>
                <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-3 gap-2 opacity-90">
                    {msgImages.map((url, index) => (
                        <div
                            key={index}
                            onClick={() => window.open(url)}
                            className="cursor-pointer rounded-md overflow-hidden"
                        >
                            <img
                                src={url}
                                alt=""
                                className="h-full w-full object-cover aspect-square rounded-md"
                            />
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Logout button restored to its original absolute position */}
            <button
                onClick={() => logout()}
                className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-light py-2 rounded-full cursor-pointer w-4/5 transition-colors duration-300"
            >
                Logout
            </button>
        </div>
    );
};

export default RightSidebar;