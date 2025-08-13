import React from 'react';

const Loader = () => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-16 h-16 border-4 border-white border-t-purple-500 rounded-full animate-spin"></div>
        </div>
    );
};

export default Loader;