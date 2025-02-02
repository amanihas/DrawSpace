import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { nanoid } from "nanoid";
import sgMail from '@sendgrid/mail'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json());

const PORT = 5000;

// Connect to MongoDB database, create user schema and model

console.log("MongoDB URI:", process.env.MONGO_URI);
console.log("SendGrid API Key loaded:", !!process.env.SENDGRID_API_KEY);



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
    verify_token: {type: String, default: ()=> nanoid(32)}

}))

// connect to  email service

sgMail.setApiKey(process.env.SENDGRID_API_KEY)




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
            <a href="http://localhost:3000/verification/${newUser.verify_token}">Verify Your Account</a>`
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