import React, { useContext, useEffect, useRef, useState } from 'react';
import assets from '../assets/assets';
import { formatMessageTime } from '../lib/utils';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ChatCointainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
      useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();
  const [input, setInput] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    await sendMessage({ text: input.trim() });
    setInput('');
  };

  const handleSendImage = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = ''; // Clear file input
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return selectedUser ? (
      <div className="h-full overflow-hidden relative bg-transparent flex flex-col">
        {/* ----------Chat Header-------------*/}
        <div className="flex items-center gap-3 py-3 mx-4 border-b border-white/20">
          <img
              src={selectedUser.profilePic || assets.avatar_icon}
              alt="Profile"
              className="w-8 h-8 rounded-full"
          />
          <p className="flex-1 text-lg text-white flex items-center gap-2">
            {selectedUser.fullName}
            {onlineUsers.includes(selectedUser._id) && (
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
            )}
          </p>
          <img
              onClick={() => setSelectedUser(null)}
              src={assets.arrow_icon}
              alt="Back"
              className="md:hidden max-w-7 cursor-pointer"
          />
          <img
              src={assets.help_icon}
              alt="Help"
              className="hidden md:block max-w-5"
          />
        </div>

        {/* ----------Chat Body-------------*/}
        <div className="flex-1 flex flex-col overflow-y-scroll p-3 pb-6">
          {/* --- FIX: Ensure `messages` is an array before mapping --- */}
          {Array.isArray(messages) && messages.map((msg, index) => (
              <div
                  key={index}
                  // --- FIX: Compare `_id` property for correct alignment ---
                  className={`flex items-end gap-2 my-2 ${
                      msg.senderId._id === authUser._id ? 'self-end' : 'self-start'
                  }`}
              >
                <div
                    // --- FIX: Compare `_id` property for correct row direction ---
                    className={`flex items-end gap-2 ${
                        msg.senderId._id === authUser._id ? 'flex-row' : 'flex-row-reverse'
                    }`}
                >
                  {/* Message Content */}
                  {msg.image ? (
                      <img
                          src={msg.image}
                          alt="Sent"
                          className="max-w-[230px] border border-white/20 rounded-lg overflow-hidden"
                      />
                  ) : (
                      <p
                          // --- FIX: Compare `_id` property for correct bubble style ---
                          className={`p-2 px-3 max-w-[250px] md:text-sm font-light rounded-lg break-words text-white ${
                              msg.senderId._id === authUser._id
                                  ? 'bg-white/20 rounded-br-none'
                                  : 'bg-black/40 rounded-bl-none'
                          }`}
                      >
                        {msg.text}
                      </p>
                  )}

                  {/* Avatar and Time */}
                  <div className="text-center text-xs">
                    <img
                        src={
                          // --- FIX: Compare `_id` property for correct avatar ---
                          msg.senderId._id === authUser._id
                              ? authUser?.profilePic || assets.avatar_icon
                              : selectedUser?.profilePic || assets.avatar_icon
                        }
                        alt="Sender"
                        className="w-7 h-7 rounded-full"
                    />
                    <p className="text-gray-400 mt-1">
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
          ))}
          <div ref={scrollEnd}></div>
        </div>

        {/* ----------Bottom Input Form-------------*/}
        <form onSubmit={handleSendMessage} className="flex items-center gap-3 p-3 mt-auto">
          <div className="flex-1 flex items-center bg-white/10 px-3 rounded-full">
            <input
                onChange={(e) => setInput(e.target.value)}
                value={input}
                type="text"
                placeholder="Send a message"
                className="flex-1 text-sm p-3 border-none rounded-lg outline-none bg-transparent text-white placeholder-gray-300"
            />
            <input
                onChange={handleSendImage}
                type="file"
                id="image"
                accept="image/png, image/jpeg"
                hidden
            />
            <label htmlFor="image">
              <img
                  src={assets.gallery_icon}
                  alt="Gallery"
                  className="w-5 mr-2 cursor-pointer"
              />
            </label>
          </div>
          <button type="submit">
            <img
                src={assets.send_button}
                alt="Send"
                className="w-7 cursor-pointer"
            />
          </button>
        </form>
      </div>
  ) : (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 bg-transparent max-md:hidden">
        <img src={assets.logo} alt="Logo" className="max-w-16 opacity-50" />
        <p className="text-lg font-medium text-white/80">
          Chat anytime, anywhere
        </p>
      </div>
  );
};

export default ChatCointainer;