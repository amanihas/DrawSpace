import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { nanoid } from "nanoid";
import sgMail from '@sendgrid/mail'
import jwt from 'jsonwebtoken'
import axios from "axios";
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


dotenv.config({ path: './backend/.env' });

const app = express()
app.use(cors())
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Connect to MongoDB database, create user schema and model


console.log("MongoDB URI:", process.env.MONGO_URI);
console.log("SendGrid API Key loaded:", !!process.env.SENDGRID_API_KEY);

// Middleware that Verifies the JWT Token

const verify_jwt_token = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const jwt_secret = process.env.JWT_SECRET;
  jwt.verify(token, jwt_secret, (err, decoded) => {
      if(err){
          console.log("UNVERIFIED CHECK AGAIN")
          return res.status(401).json({message: "Unauthorized"});}
     
      req.user = decoded;
      next();
  })
}

app.get("/verifyUser/:token", async (req,res) =>{
  const {token} = req.params;
  console.log(token)

  try{
     const updatedUser = await  User.findOneAndUpdate(
          { verify_token: token },  
          { $set: { validated: true } }, 
          { new: true } 
      );

  }
  catch(err){
      console.log(err)
      return res.status(500).json({ message: "Server error during verification" });
  }
 return  res.status(200).json({message:"User Verified"})
})



// Endpoint that Returns User Data
// Used by the User Dashboard to Display User Data

app.get("/user-data",verify_jwt_token, async (req, res) => {
  const user = await User.findOne({userName: req.user.userName});
  return res.status(200).json({userName: user.userName, email: user.email});
})


// Serve static files from React in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}



mongoose.connect(process.env.MONGO_URI, {
    useNewURLParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connection Sucsessful"))
.catch(err => console.log("Connection Error", err))

const User = mongoose.model("User",new mongoose.Schema({
    _id: {
        type:String,
        default: () => nanoid()
    },
    userName: String,
    password: String,
    email: String,
    validated: {type: Boolean, default: false},
    verify_token: {type: String, default: ()=> nanoid(32)},
    friends_list: [{
        friend_id: String,
        friend_username: String
      }],
      gallery: [{
        image_id: {
          type: String,
          default: () => nanoid(16)
        },
        image_title: String,
        date_created: {
          type: Date,
          default: Date.now
        }
      }]
    }));





// Connects to the Email Service with SendGrid Key

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const cloudFlare_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const cloudFlare_API_KEY = process.env.CLOUDFLARE_GLOBAL_API_KEY
const cloudFlare_Email = process.env.CLOUDFLARE_EMAIL


// Endpoint that Handles User Registration
// User Receives an Email with a Verification Link

app.post("/HandleRegistration", async (req, res)=>{

    try {
        const {userName, password, email} = req.body
        const newUser = new User({userName, email,password})
        await newUser.save();
        const unixTimestamp = Math.floor(Date.now()/1000)



        const msg = {
            to: email,
            from: 'servlet330@gmail.com',
            subject: 'Email Verification',
            text: `Your Journey at DrawSpace is just Beginning! Click the following link to verify: \n
            <a href="https://morning-river-24657-2a6c6eb4ef81.herokuapp.com/verification/${newUser.verify_token}">Verify Your Account</a>`
        }

        sgMail
            .send(msg)
            .then(() => {
                console.log("Email sent to " + newUser.email)
                return res.json({message: 'User ' + userName + ' was inserted to the database at ' + unixTimestamp})
            })
            .catch((error) => {
                console.error(error)
            })
        
    } catch (error) {
        return res.status(500).json({message: "Server-Side Error registering user"})
    }
})

// Endpoint that Handles User Sign In
// Checks for the User in the Database
// Handles Wrong Passwords and Unverified Users, and Nonexistent Users
// If the User is Valid, a JWT Token is Sent to the User
// JWT Token is used to Authenticate the User, for the Canvas, Dashboard, and Brainstormer

app.post("/HandleSignIn", async (req, res) => {
    try {
        const {userName, password} = req.body;
        const user = await User.findOne({userName: userName});
        if(!user) return res.status(404).json({message: "User not found"});
        else if(user.password !== password) return res.status(401).json({message: "Password Incorrect"});
        else if(!user.validated) return res.status(401).json({message: "User not Verified"});
        else{
        const jwt_secret = process.env.JWT_SECRET;
        const token = jwt.sign({userName: user.userName}, jwt_secret, {expiresIn: "1h"});
        console.log("User " + user.userName + " signed in at " + Math.floor(Date.now
        ()/1000));
        return res.status(200).json({message: "Sign In Successful", token: token});
        }
    } catch (error) {
        return res.status(500).json({message: "Server-Side Error Signing In"});
    }
}
)



// Endpoint that updates the user gallery once an image is uploaded
// contains the image_id, title and date created 

app.post('/update-user-gallery', async (req, res) => {
    const {user_data, image_id, image_title, date_created } = req.body;
    const { userName, email } = user_data;
     
    try {
      const user = await User.findOne(user_data);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      user.gallery.push({ image_id, image_title, date_created });
      await user.save();
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

// cloudFlare get Upload URL 

app.post('/getUploadURL', async (req, res) => {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cloudFlare_ID}/images/v2/direct_upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_BEARER_TOKEN}`
      }
    });
  
    const data = await response.json();
    if (response.ok) {
      // You should get an upload URL from the response
      res.json(data)
    } else {
      console.error('Error creating direct upload:', data);
      throw new Error('Failed to get upload URL');
    }
  });



// Endpoint that Verifies the User
// Once Clicked the User is Validated and can Sign In

app.get("/verifyUser/:token", async (req,res) =>{
    const {token} = req.params;
    console.log(token)

    try{
       const updatedUser = await  User.findOneAndUpdate(
            { verify_token: token },  
            { $set: { validated: true } }, 
            { new: true } 
        );

    }
    catch(err){
        console.log(err)
        return res.status(500).json({ message: "Server error during verification" });
    }
   return  res.status(200).json({message:"User Verified"})
})

app.listen(PORT, ()=> console.log("Backend Running at port " + PORT ))