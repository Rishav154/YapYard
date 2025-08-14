import React, { useState, useContext } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../components/Loader';
import assets from '../assets/assets';

// --- Icon Components (from your original file) ---
const GoogleIcon = () => ( <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 6.58C34.566 2.734 29.626 0 24 0C10.745 0 0 10.745 0 24s10.745 24 24 24s24-10.745 24-24c0-1.745-.246-3.75-.689-5.917z"></path><path fill="#FF3D00" d="M6.306 14.691c-2.229 3.593-3.447 7.901-3.447 12.31C2.859 32.099 4.077 36.407 6.306 39.999L15.65 31.9c-1.125-2.025-1.8-4.3-1.8-6.699s.675-4.674 1.8-6.699L6.306 14.691z"></path><path fill="#4CAF50" d="M24 48c5.627 0 10.573-2.734 14.802-6.58l-9.498-8.411c-2.149 1.45-4.842 2.3-7.304 2.3c-5.223 0-9.66-3.343-11.303-8H2.859c2.944 6.452 9.596 11 17.141 11.583L24 48z"></path><path fill="#1976D2" d="M43.611 20.083L43.611 20.083H42V20H24v8h11.303c-.792 2.447-2.231 4.488-4.092 5.999l9.498 8.411C41.902 38.372 45.247 32.059 45.247 24c0-3.197-.833-6.223-2.311-8.791l-1.326-2.126z"></path></svg> );
const EyeIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );
const EyeOffIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" /></svg> );

const LoginPage = () => {
    const [currState, setCurrState] = useState("Login");
    const [user, setUser] = useState({ fullName: "", email: "", password: "", bio: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Get login and new Google login handler from AuthContext
    const { login, handleGoogleLoginSuccess, axios } = useContext(AuthContext);

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setUser(prevUser => ({...prevUser, [name]: value}));
    }

    // Handles traditional email/password login/signup
    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const endpoint = currState === "Sign up" ? 'signup' : 'login';
            await login(endpoint, user);
        } catch (error) {
            console.error("Authentication failed:", error);
            toast.error("Authentication failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    // Sets up the Google Login flow using the 'auth-code' method
    const googleLogin = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: async (codeResponse) => {
            setIsLoading(true);
            try {
                // Send the one-time authorization code to the backend
                const { data } = await axios.post("/api/auth/google/callback", {
                    code: codeResponse.code,
                });
                // On successful response from backend, update auth state
                handleGoogleLoginSuccess(data);
            } catch (error) {
                const errorMessage = error.response?.data?.message || "Google login failed.";
                toast.error(errorMessage);
                console.error("Google login error:", error);
            } finally {
                setIsLoading(false);
            }
        },
        onError: (error) => {
            console.error('Google Login Failed:', error);
            toast.error("An error occurred during Google sign-in.");
        },
    });

    return (
        <>
            {isLoading && <Loader />}
            <div className="bg-[url('/bgImage.png')] bg-cover bg-center min-h-screen flex flex-col items-center justify-center p-4">
                <img src={assets.logo} alt="Logo" className='h-12 w-auto mb-8' />
                <div className="w-full max-w-md bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6 border border-white/30">
                    <h2 className='text-center text-3xl font-bold text-slate-700 tracking-tight'>{currState}</h2>
                    <form onSubmit={onSubmitHandler} className='space-y-6'>
                        {currState === "Sign up" && (
                            <>
                                <input name="fullName" onChange={onChangeHandler} value={user.fullName} type="text" placeholder='Full Name' className='w-full p-3 bg-white/50 text-slate-700 rounded-lg border-2 border-transparent focus:outline-none focus:border-violet-400 placeholder:text-slate-500' required autoComplete="name" />
                                <textarea name="bio" onChange={onChangeHandler} value={user.bio} rows={3} placeholder='Tell us a little about yourself...' className='w-full p-3 bg-white/50 text-slate-700 rounded-lg border-2 border-transparent focus:outline-none focus:border-violet-400 placeholder:text-slate-500' required />
                            </>
                        )}
                        <input name="email" onChange={onChangeHandler} value={user.email} type="email" placeholder='Email Address' required className='w-full p-3 bg-white/50 text-slate-700 rounded-lg border-2 border-transparent focus:outline-none focus:border-violet-400 placeholder:text-slate-500' autoComplete="email"/>
                        <div className="relative">
                            <input
                                name="password"
                                onChange={onChangeHandler}
                                value={user.password}
                                type={showPassword ? "text" : "password"}
                                placeholder='Password'
                                required
                                className='w-full p-3 pr-10 bg-white/50 text-slate-700 rounded-lg border-2 border-transparent focus:outline-none focus:border-violet-400 placeholder:text-slate-500'
                                autoComplete={currState === 'Login' ? 'current-password' : 'new-password'}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3">
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        <button type='submit' className='w-full p-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-700 hover:to-violet-700 transition-all duration-300'>
                            {currState === "Sign up" ? "Create Account" : "Login"}
                        </button>
                    </form>

                    <div className="flex items-center justify-center space-x-2">
                        <hr className="w-full border-gray-400/50" />
                        <span className="px-2 text-slate-600 font-medium">OR</span>
                        <hr className="w-full border-gray-400/50" />
                    </div>

                    <button
                        type="button"
                        onClick={() => googleLogin()}
                        className='w-full flex items-center justify-center gap-3 p-3 bg-white text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition-all duration-300'
                    >
                        <GoogleIcon />
                        Continue with Google
                    </button>

                    <div className='text-center text-slate-600'>
                        {currState === "Sign up" ? (
                            <p>Already have an account? <span onClick={() => setCurrState("Login")} className='font-semibold text-violet-600 hover:text-violet-500 cursor-pointer'>Login here</span></p>
                        ) : (
                            <p>Don't have an account? <span onClick={() => setCurrState("Sign up")} className='font-semibold text-violet-600 hover:text-violet-500 cursor-pointer'>Create one</span></p>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginPage;