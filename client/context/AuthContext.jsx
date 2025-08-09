import { useState, createContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";



const backendUrl= import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;



export const AuthContext = createContext();

export const AuthProvider = ({children}) =>{
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // check if user is authticated and if so set the usser datdd and connect the socket

    const checkAuth = async () =>{
        try {
            const {data}= await axios.get("/api/auth/check")
            if(data.success){
                setAuthUser(data.userData);
                connectSocket(data.userData);
            }
        } catch (error) {
            toast.error(error.message)
            // This is expected if the user isn't logged in, so we won't show a toast.
            //setAuthUser(null);
            //console.error("Auth check failed (expected on logout):", error.message);
        }
    }

    // login func ti handlle user authentication and socket connection
    const login = async (state, credentials) =>{
        try {
            const {data} = await axios.post(`/api/auth/${state}`, credentials);
            if(data.success){
                // Use data.user for consistency with other functions
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;


                setToken(data.token);
                localStorage.setItem("token", data.token)
                toast.success(data.message)
            }else{
                // Show specific error from backend if available
                toast.error(data.message)
            }

        } catch (error) {
            // Show specific error from backend if available, otherwise generic message
            const errorMessage = error.response?.data?.message || error.message;
            toast.error(errorMessage);
        }
    }

    //logout fuction to handle user logout and socket disconnection

    const logout = async () =>{
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("logged out successfully")
        socket.disconnect();
    }

    //Update profile funtion to handle user profile updates

    const updateProfile = async (body) =>{
        try {
            const {data} = await axios.put("/api/auth/update-profile", body);
            if(data.success){
                setAuthUser(data.userData);
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            
            toast.error(error.message);
        }
    }

//connect socket fuction to handle socket connection and online users updates
    const connectSocket =  (userData) =>{
        if(!userData|| socket?.connected) return;
        const newSocket = io(
            backendUrl,{
                query:{
                    userId: userData._id,
                }
            }
        );
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds)=>{
            setOnlineUsers(userIds);
       
        })
    }


    useEffect(()=>{
        const verifyUser = async () => {
            if(token){
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                await checkAuth();
            }
            setIsLoading(false);
        }
        verifyUser();
    },[token])



    const value ={
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
        isLoading,
        
    }
    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
