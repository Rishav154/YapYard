import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';


const ProfilePage = () => {

  const{authUser, updateProfile} = useContext(AuthContext)
  const[selectedImg, setSelectedImg] = useState(null)
  const navigate = useNavigate();
  const[name,setName]= useState(authUser.fullName)
  const[bio, setBio] = useState(authUser.bio)

  useEffect(() => {
    if (authUser) {
      setName(authUser.fullName || "");
      setBio(authUser.bio || "");
    }
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!selectedImg){
      await updateProfile({
        fullName: name,
        bio
      });
      navigate('/');
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onloadend = async () => {
      const base64Image = reader.result;
      await updateProfile( { profilePic: base64Image, fullName: name, bio })
      navigate('/');
    }
  }


  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300  border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg relative'>
      <img onClick={() => navigate(-1)} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer absolute top-4 right-4 rotate-180' />
        <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1' >
          <h3 className='text-lg'>Profile Details</h3>
          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input onChange={(e) => setSelectedImg(e.target.files[0])} type="file" id="avatar" accept='.png, .jpg, .jpeg' hidden/>
            <img src={selectedImg? URL.createObjectURL(selectedImg) : assets.avatar_icon} alt="" className={`w-12 h-12 object-cover ${selectedImg  && "rounded-full"}`}/>
            Upload profile image
          </label>
          <div className='flex flex-col gap-2'>
            <label htmlFor="name">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" id="name" placeholder='Full Name' className='p-2 bg-transparent border border-gray-500 rounded-md focus:outline-none placeholder:text-gray-400' required />
          </div>
          <div className='flex flex-col gap-2'>
            <label htmlFor="bio">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} id="bio" rows={3} placeholder='Provide a short bio' className='p-2 bg-transparent border border-gray-500 rounded-md focus:outline-none placeholder:text-gray-400' required></textarea>
          </div>
          <button type='submit' className='bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer py-2 mt-2'>
            Save Changes
          </button>
        </form>
        <img className= {`max-w-44 aspect-square rounded-full mx-10 mx-sm:mt-10 ${selectedImg  && "rounded-full"}`} src= {authUser?.profilePic || assets.logo_icon} alt="" />
      </div>
    </div>
  )
}

export default ProfilePage
