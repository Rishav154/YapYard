import React, { useContext } from 'react';
import Sidebar from '../components/Sidebar';
import ChatCointainer from '../components/ChatCointainer';
import RightSidebar from '../components/RightSidebar';
import { ChatContext } from '../../context/ChatContext';

const HomePage = () => {
    const { selectedUser } = useContext(ChatContext);
    return (
        //  Updated background to use your new image and be centered
        <div className="bg-[url('/bgImageHome.svg')] bg-cover bg-center w-full h-screen sm:px-[15%] sm:py-[5%]">
            {/* Updated the main container for a better glass effect */}
            <div
                className={`bg-black/30 backdrop-blur-xl border border-white/20
         rounded-3xl overflow-hidden h-full grid grid-cols-1 relative ${
                    selectedUser
                        ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]'
                        : 'md:grid-cols-2'
                }`}
            >
                <Sidebar />
                <ChatCointainer />
                <RightSidebar />
            </div>
        </div>
    );
};

export default HomePage;