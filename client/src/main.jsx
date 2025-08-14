import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter} from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext.jsx' 
import ChatProvider from '../context/ChatContext.jsx'
import {GoogleOAuthProvider} from "@react-oauth/google";




createRoot(document.getElementById('root')).render(
  
    <BrowserRouter>
        <GoogleOAuthProvider clientId={`${import.meta.env.VITE_GOOGLE_CLIENT_ID}`}>
              <AuthProvider>
                <ChatProvider>
                   <App />
                </ChatProvider>
              </AuthProvider>
        </GoogleOAuthProvider>
    </BrowserRouter>
  
)
