import express from "express";
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import userRouter from './routes/auth.js';


const app=express();
const PORT=process.env.PORT;

app.use(cors({
    origin: process.env.CORS_ORIGINS,
    credentials: true //means from different place cookies are
    //allowed
}))

app.use(bodyParser.json({limit :"4kb"}))
app.use(bodyParser.urlencoded({extended:true, limit: "4kb"}));
app.use(express.static('public')) // To store the information that front end might provide

app.use(cookieParser());


app.use('/',userRouter)
const getUser =(req,res,next)=>{
    const user=req.user;
    if(!user){
        return res.status(401).json({user:undefined})
    }
    return res.status(200).json({user})

}
app.get('/getuser',verifyJWT,getUser);

import restaurantRouter from "./routes/restaurant.js";
import { verifyJWT } from "./middlewares/verifyJWT.js";
app.use('/restaurant', verifyJWT, restaurantRouter)


 
mongoose.connect(`${process.env.DB_PATH}/${process.env.DB_NAME}`)
    .then(()=>{
        app.listen(PORT,()=>{
            console.log(`http://localhost:`+PORT)
        });
    })
    .catch(err=>{
        console.log(err)
    })
