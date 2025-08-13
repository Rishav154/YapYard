import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import {Toaster} from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext'


const App = () => {
  const { authUser, isLoading } = useContext(AuthContext)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url('./src/assets/bgImageHome.svg')] bg-contain">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (  
    <div className = "">
      <Toaster/>
      <Routes>
        <Route path = '/' element = {authUser ? <HomePage/> : <Navigate to= "/login" />}/>
        <Route path = '/login' element = { !authUser ? <LoginPage/> : <Navigate to= "/" /> }/>
        <Route path = '/profile' element = { authUser ?  <ProfilePage/> : <Navigate to= "/login" />}/>
      </Routes>
    </div>
  )
}

export default App
