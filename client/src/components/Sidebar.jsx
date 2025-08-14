import React, { useEffect, useState, useContext, useRef } from 'react';
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
    const { logout, onlineUsers } = useContext(AuthContext);

    const [input, setinput] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false); // State to control menu visibility
    const menuRef = useRef(); // Ref to detect outside clicks
    const navigate = useNavigate();

    const filteredUsers = input
        ? users.filter((user) =>
            user.fullName.toLowerCase().includes(input.toLowerCase())
        )
        : users;

    useEffect(() => {
        getUsers();
    }, [onlineUsers]);

    // Effect to handle clicks outside of the menu to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        // Add listener when menu is open
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        // Cleanup listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);


    return (
        <div
            className={`bg-transparent h-full p-3 sm:p-5 overflow-y-scroll text-white border-r border-white/10 ${
                selectedUser ? 'max-md:hidden' : 'w-full'
            }`}
        >
            <div className="pb-5">
                <div className="flex justify-between items-center">
                    <img src={assets.logo} alt="logo" className="max-w-9" />
                    
                    {/* The Menu Button and Dropdown */}
                    <div ref={menuRef} className="relative py-2">
                        <img
                            onClick={() => setIsMenuOpen(!isMenuOpen)} // Toggle menu on click
                            src={assets.menu_icon}
                            alt="Menu"
                            className="max-h-5 cursor-pointer"
                        />
                        {/* The Dropdown: Visibility is now controlled by isMenuOpen state */}
                        <div 
                            className={`absolute top-full right-0 z-20 w-32 p-4 rounded-md bg-violet-700/40 backdrop-blur-lg border border-white/10 text-gray-100 transition-opacity duration-300 ${isMenuOpen ? 'block' : 'hidden'}`}
                        >
                            <p
                                onClick={() => {
                                    navigate('/profile');
                                    setIsMenuOpen(false); // Close menu on navigation
                                }}
                                className="cursor-pointer text-sm w-full text-left bg-transparent border-none p-0"
                            >
                                Edit Profile
                            </p>
                            <hr className="my-2 border-t border-white/20" />
                            <p
                                onClick={() => {
                                    logout();
                                    setIsMenuOpen(false); // Close menu on action
                                }}
                                className="cursor-pointer text-sm w-full text-left bg-transparent border-none p-0"
                            >
                                Logout
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Search Bar */}
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
            {/* User List */}
            <div className="flex flex-col">
                {(filteredUsers || []).map((user, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            setSelectedUser(user);
                            setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
                        }}
                        className={`relative flex items-center gap-2 p-2 pl-4 rounded-lg cursor-pointer max-sm:text-sm transition-colors duration-300 hover:bg-white/10 ${
                            selectedUser?._id === user._id && 'bg-white/10'
                        }`}
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