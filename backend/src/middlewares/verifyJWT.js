import  jwt  from "jsonwebtoken";
import User from "../models/user.js";
import ErrorWrapper from "../utils/ErrorWrapper.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const verifyJWT=ErrorWrapper(async (req,res,next)=>{
    //pick up refresh and access tokens
    const incomingRefreshToken=req.cookies.RefreshToken;
    const incomingAcessToken=req.cookies.AccessToken;
    // console.log(incomingRefreshToken,incomingAcessToken);

    //check if the tokens are there
    if(!incomingRefreshToken || !incomingAcessToken){
        throw new ErrorHandler(401,"Not authorized, Kindly login to access this resource, login first and then try");
    }

   try {
        //check if the tokens are valid i.e get userinfo
        let userInfo = jwt.verify(incomingAcessToken, process.env.ACCESS_TOKEN_KEY);
        //find user from the userinfo usinf it's id 
        let user =await User.findOne({
            _id: userInfo.userId
        })
     
        //check if the reshtoken incoming is same as stored in db when login
        let userRefreshToken=user.refreshToken;
        if(incomingRefreshToken!==userRefreshToken){
            throw new ErrorHandler(402,"Not authorized, Kindly login first and then try again !")
        }
    
       req.user=user;

       next();

   } catch (error) {
        throw new ErrorHandler(500,"Internal server error while login!")
   }
})

