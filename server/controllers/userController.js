//sign up a new user
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import { OAuth2Client } from "google-auth-library";


const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage'
);

export const signup = async (req,res)=> {
    const{ fullName, email, password, bio} = req.body;
    try{
        if(!fullName || !email || !password || !bio){
            return res.json({success: false , message: "Missing Details"})
        }
        const user = await User.findOne({email});
        if(user){
            return res.json({success: false , message: "User already exists"})
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({fullName, email, password: hashedPassword, bio});

        const token = generateToken(newUser._id);

        res.json({success:true, userData: newUser, token, message: "User created successfully"})



    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    
    }
     
}

export const login = async (req,res)=>{
    try{
        const {email, password} = req.body;
        const userData= await User.findOne({email});
        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if(!isPasswordCorrect){
            return res.json({success: false, message: "Invalid Credentials"});
        }
        
    
    const token = generateToken(userData._id);

        res.json({success:true, userData, token, message: "User logged in successfully"})


        
    }catch(error){
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

export const googleAuthCallback = async (req, res) => {
    const { code } = req.body;

    try {
        // Exchange authorization code for tokens
        const { tokens } = await oAuth2Client.getToken(code);
        const { id_token } = tokens;

        // Verify the ID token and get user info
        const ticket = await oAuth2Client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name: fullName, picture: googleProfilePicUrl } = payload; // Renamed for clarity

        // Find or create the user in your database
        let user = await User.findOne({ googleId });

        if (!user) {
            user = await User.findOne({ email });
            if (user) {
                // Existing user is linking their Google account
                user.googleId = googleId;
                // Only update the profile pic if they don't already have one
                if (!user.profilePic && googleProfilePicUrl) {
                    const upload = await cloudinary.uploader.upload(googleProfilePicUrl); // ✨ FIX: Upload Google URL to Cloudinary
                    user.profilePic = upload.secure_url;
                }
            } else {
                // This is a brand new user signing up with Google
                let newProfilePicUrl = '';
                if (googleProfilePicUrl) {
                    const upload = await cloudinary.uploader.upload(googleProfilePicUrl); // ✨ FIX: Upload Google URL to Cloudinary
                    newProfilePicUrl = upload.secure_url;
                }
                user = new User({
                    googleId,
                    email,
                    fullName,
                    profilePic: newProfilePicUrl, // ✨ FIX: Save the new Cloudinary URL
                });
            }
            await user.save();
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Google authentication successful",
            token,
            userData: user,
        });

    } catch (error) {
        console.error("Error during Google OAuth callback:", error);
        res.status(500).json({ success: false, message: "Authentication failed" });
    }
};

export const checkAuth = async (req,res)=>{
    res.json({success: true, userData: req.user})
}

export const updateProfile = async (req,res)=>{
    try {
        const{profilePic, bio, fullName} = req.body;
        const userId= req.user._id;
        let updatedUser;

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true});

        }else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName}, {new: true});
        }
        res.json({success: true, userData: updatedUser})
    
    }

        
     catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

