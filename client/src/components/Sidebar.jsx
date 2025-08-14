import React, { useEffect, useState, useContext } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';

const Sidebar = () => {
    const {
        getUsers,
        users,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
    } = useContext(ChatContext);
    const { logout, onlineUsers, authUser } = useContext(AuthContext);

    const [input, setinput] = useState(false);
    const navigate = useNavigate();
    const filteredUsers = input
        ? users.filter((user) =>
            user.fullName.toLowerCase().includes(input.toLowerCase())
        )
        : users;

    useEffect(() => {
        getUsers();
    }, [onlineUsers]);

    return (
        // Removed background, added border for separation
        <div
            className={`bg-transparent h-full p-5 overflow-y-scroll text-white border-r border-white/10 ${
                selectedUser ? 'max-md:hidden' : ''
            }`}
        >
            <div className="pb-5">
                <div className="flex justify-between items-center">
                    <img src={assets.logo} alt="logo" className="max-w-9" />
                    <div className="relative py-2 group">
                        <img
                            src={assets.menu_icon}
                            alt="Menu"
                            className="max-h-5 cursor-pointer"
                        />
                        {/* Updated menu style */}
                        <div className="absolute top-full right-0 z-20 w-32 p-4 rounded-md bg-violet-700/40 backdrop-blur-lg border border-white/10 text-gray-100 hidden group-hover:block">
                            <p
                                onClick={() => navigate('/profile')}
                                className="cursor-pointer text-sm w-full text-left bg-transparent border-none p-0"
                            >
                                Edit Profile
                            </p>
                            <hr className="my-2 border-t border-white/20" />
                            <p
                                onClick={() => logout()}
                                className="cursor-pointer text-sm w-full text-left bg-transparent border-none p-0"
                            >
                                Logout
                            </p>
                        </div>
                    </div>
                </div>
                {/* Updated search bar style */}
                <div className="bg-white/10 rounded-full flex items-center gap-2 py-3 px-4 mt-5">
                    <img src={assets.search_icon} alt="search" className="w-3" />
                    <input
                        onChange={(e) => setinput(e.target.value)}
                        type="text"
                        className="bg-transparent border-none outline-none text-white text-xs placeholder-gray-300 flex-1"
                        placeholder="Search User..."
                    />
                </div>
            </div>
            <div className="flex flex-col">
                {(filteredUsers || []).map((user, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            setSelectedUser(user);
                            setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
                        }}
                        // Updated selected user style
                        className={`relative flex items-center gap-2 p-2 pl-4 rounded-lg cursor-pointer max-sm:text-sm transition-colors duration-300 hover:bg-white/10 ${
                            selectedUser?._id === user._id && 'bg-white/10'
                        }}`}
                    >
                        <img
                            src={user?.profilePic || assets.avatar_icon}
                            alt=""
                            className="w-[35px] aspect-[1/1] rounded-full"
                        />
                        <div className="flex flex-col leading-5">
                            <p>{user.fullName}</p>
                            {onlineUsers.includes(user._id) ? (
                                <span className="text-green-400 text-xs">Online</span>
                            ) : (
                                <span className="text-neutral-400 text-xs">Offline</span>
                            )}
                        </div>
                        {/* Updated unseen message badge style */}
                        {unseenMessages[user._id] > 0 && (
                            <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-white/20">
                                {unseenMessages[user._id]}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;