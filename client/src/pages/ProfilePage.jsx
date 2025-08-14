import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../components/Loader';


const ProfilePage = () => {
    const { authUser, updateProfile } = useContext(AuthContext);
    const [selectedImg, setSelectedImg] = useState(null);
    const navigate = useNavigate();
    const [name, setName] = useState(authUser.fullName);
    const [bio, setBio] = useState(authUser.bio);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (authUser) {
            setName(authUser.fullName || "");
            setBio(authUser.bio || "");
        }
    }, [authUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const profileData = { fullName: name, bio };
            if (selectedImg) {
                const reader = new FileReader();
                reader.readAsDataURL(selectedImg);
                await new Promise((resolve, reject) => {
                    reader.onloadend = () => {
                        profileData.profilePic = reader.result;
                        resolve();
                    };
                    reader.onerror = reject;
                });
            }
            await updateProfile(profileData);
            navigate('/');
        } catch (error) {
            console.error("Failed to update profile:", error)
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <>
            {isLoading && <Loader />}
            <div className="bg-[url('/bgImage.png')] bg-cover min-h-screen flex items-center justify-center p-4">
                {/* The main card container */}
                <div className='w-full max-w-2xl bg-white/20 backdrop-blur-xl text-slate-700 border border-white/30 flex items-center justify-between max-sm:flex-col-reverse rounded-2xl relative shadow-2xl'>
                    <img onClick={() => navigate(-1)} src={assets.arrow_icon} alt="Back" className='w-5 cursor-pointer absolute top-5 right-5 rotate-180' />
                    
                    {/* The form, with responsive padding */}
                    <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-6 sm:p-10 flex-1' >
                        <h3 className='text-2xl font-bold text-slate-700'>Profile Details</h3>
                        <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer font-medium text-slate-600 hover:text-slate-800'>
                            <input onChange={(e) => setSelectedImg(e.target.files[0])} type="file" id="avatar" accept='.png, .jpg, .jpeg' hidden />
                            <img src={selectedImg ? URL.createObjectURL(selectedImg) : (authUser?.profilePic || assets.avatar_icon)} alt="" className="w-12 h-12 object-cover rounded-full border-2 border-white/50" />
                            Upload new image
                        </label>
                        <div className='flex flex-col gap-2'>
                            <label htmlFor="name" className='font-medium'>Full Name</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} type="text" id="name" placeholder='Full Name' className='p-2 bg-white/50 text-slate-700 border border-white/40 rounded-md focus:outline-none focus:border-violet-400 placeholder:text-slate-500' required />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label htmlFor="bio" className='font-medium'>Bio</label>
                            <textarea value={bio} onChange={(e) => setBio(e.target.value)} id="bio" rows={3} placeholder='Provide a short bio' className='p-2 bg-white/50 text-slate-700 border border-white/40 rounded-md focus:outline-none focus:border-violet-400 placeholder:text-slate-500' required></textarea>
                        </div>
                        <button type='submit' className='bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-md cursor-pointer py-2 mt-2 hover:from-purple-700 hover:to-violet-700 transition-all duration-300'>
                            Save Changes
                        </button>
                    </form>

                    {/* The profile picture preview area, with responsive padding and image size */}
                    <div className="flex-shrink-0 p-6 sm:p-10 max-sm:pt-10 max-sm:pb-0">
                        <img className="w-36 h-36 sm:w-44 sm:h-44 object-cover rounded-full mx-auto shadow-lg border-4 border-white/50" src={selectedImg ? URL.createObjectURL(selectedImg) : (authUser?.profilePic || assets.avatar_icon)} alt="Current Profile" />
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProfilePage